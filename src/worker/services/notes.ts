import { AppError } from "../http"
import {
  createNote,
  createReviewLog,
  deleteNote,
  getNoteById,
  getNotesByUser,
  REVIEW_RESULTS,
  updateNote,
  updateNoteReview,
} from "../db"
import {
  assertMaxLength,
  LIMITS,
  normalizeTags,
  normalizeText,
} from "./validation"
import { assertOwnedSubject } from "./subjects"
import type { ReviewResult } from "../db"
import OpenAI from "openai"
import { env } from "cloudflare:workers"

type AiFlashcard = { type: "flashcard"; front: string; back: string }
type AiSmartSummarySection = { heading: string; bullets: string[] }
type AiSmartSummary = {
  title: string
  overview: string
  sections: AiSmartSummarySection[]
  keyTakeaways: string[]
}

export async function listNotes(db: D1Database, userId: string) {
  return getNotesByUser(db, userId)
}

export async function getOwnedNote(db: D1Database, userId: string, id: string) {
  const note = await getNoteById(db, id, userId)
  if (!note) throw new AppError(404, "not_found", "Note not found")
  return note
}

export async function createNoteForUser(
  db: D1Database,
  userId: string,
  input: {
    subject_id: string
    title: string
    content?: string
    tags?: string[] | null
  }
) {
  await assertOwnedSubject(db, userId, input.subject_id)
  const content = input.content ?? ""
  assertMaxLength(content, LIMITS.noteContent, "content")
  return createNote(
    db,
    userId,
    input.subject_id,
    normalizeText(input.title, LIMITS.title, "title"),
    content,
    normalizeTags(input.tags)
  )
}

export async function updateNoteForUser(
  db: D1Database,
  userId: string,
  id: string,
  input: { title: string; content: string; tags?: string[] | null }
) {
  assertMaxLength(input.content, LIMITS.noteContent, "content")
  const note = await updateNote(
    db,
    id,
    userId,
    normalizeText(input.title, LIMITS.title, "title"),
    input.content,
    normalizeTags(input.tags)
  )
  if (!note) throw new AppError(404, "not_found", "Note not found")
  return note
}

export async function deleteNoteForUser(
  db: D1Database,
  userId: string,
  id: string
) {
  const deleted = await deleteNote(db, id, userId)
  if (!deleted) throw new AppError(404, "not_found", "Note not found")
}

export async function reviewNoteForUser(
  db: D1Database,
  userId: string,
  id: string,
  input: { mastery_score: number; result: ReviewResult }
) {
  if (!REVIEW_RESULTS.includes(input.result)) {
    throw new AppError(400, "bad_request", "result is invalid")
  }
  const updated = await updateNoteReview(db, id, userId, input.mastery_score)
  if (!updated) throw new AppError(404, "not_found", "Note not found")
  await createReviewLog(db, userId, id, input.result)
}

const flashcardResponseSchema = {
  parse(raw: string): AiFlashcard[] | null {
    try {
      const parsed = JSON.parse(raw) as {
        flashcards?: Array<{ front?: unknown; back?: unknown }>
      }
      if (!Array.isArray(parsed.flashcards)) {
        return null
      }
      const flashcards = parsed.flashcards.flatMap((item) => {
        if (typeof item.front !== "string" || typeof item.back !== "string") {
          return []
        }
        const front = item.front.trim()
        const back = item.back.trim()
        if (!front || !back) return []
        return [{ type: "flashcard" as const, front, back }]
      })
      return flashcards
    } catch {
      return null
    }
  },
}

const smartSummaryResponseSchema = {
  parse(raw: string): AiSmartSummary | null {
    try {
      const parsed = JSON.parse(raw) as {
        title?: unknown
        overview?: unknown
        sections?: Array<{ heading?: unknown; bullets?: unknown }>
        keyTakeaways?: unknown
      }
      if (
        typeof parsed.title !== "string" ||
        typeof parsed.overview !== "string" ||
        !Array.isArray(parsed.sections) ||
        !Array.isArray(parsed.keyTakeaways)
      ) {
        return null
      }

      const title = parsed.title.trim()
      const overview = parsed.overview.trim()
      const sections = parsed.sections.flatMap((section) => {
        if (
          typeof section.heading !== "string" ||
          !Array.isArray(section.bullets)
        ) {
          return []
        }
        const heading = section.heading.trim()
        const bullets = section.bullets
          .map((bullet) => (typeof bullet === "string" ? bullet.trim() : null))
          .filter((bullet): bullet is string => !!bullet)
        if (!heading || bullets.length === 0) return []
        return [{ heading, bullets }]
      })

      const keyTakeaways = parsed.keyTakeaways
        .map((item) => (typeof item === "string" ? item.trim() : null))
        .filter((item): item is string => !!item)

      return {
        title,
        overview,
        sections: sections as AiSmartSummarySection[],
        keyTakeaways,
      }
    } catch {
      return null
    }
  },
}

const ocrResponseSchema = {
  parse(raw: string): { text: string } | null {
    try {
      const parsed = JSON.parse(raw) as { text?: unknown }
      if (typeof parsed.text !== "string") return null
      const text = parsed.text.trim()
      if (!text) return null
      return { text }
    } catch {
      return null
    }
  },
}

function getAiModel(): string {
  return env.CF_AIG_MODEL || "workers-ai/@cf/google/gemma-4-26b-a4b-it"
}

function createAiClient() {
  return new OpenAI({
    apiKey: env.CF_AIG_TOKEN,
    baseURL:
      env.CF_AIG_URL,
  })
}

export async function extractTextFromImageUrl(
  imageUrl: string,
  imageBytes: number,
  imageType: string,
  userId: string
) {
  const requestId = crypto.randomUUID()
  const startedAt = Date.now()

  try {
    const client = createAiClient()
    const completion = await client.chat.completions
      .create({
        model: getAiModel(),
        messages: [
          {
            role: "system",
            content:
              "Transcribe all readable text from the image in reading order. Think briefly and return only the final JSON object; do not include reasoning, markdown, commentary, or alternative schemas. Use this exact shape: {\"text\":\"\"}. Preserve the original language and basic structure. Do not summarize, translate, explain, or invent content. Use [tidak terbaca] only for genuinely unreadable text. Keep text plain.",
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "image_transcription",
            strict: true,
            schema: {
              type: "object",
              properties: { text: { type: "string" } },
              required: ["text"],
              additionalProperties: false,
            },
          },
        },
        temperature: 0,
      })
      .withResponse()

    const raw = completion.data.choices[0]?.message?.content?.trim() ?? ""
    if (!raw) {
      throw new AppError(422, "ocr_no_text", "No readable text found in image")
    }

    const parsed = ocrResponseSchema.parse(raw)
    if (!parsed) {
      throw new AppError(
        502,
        "ai_invalid_response",
        "Invalid OCR response format"
      )
    }

    console.info(
      JSON.stringify({
        level: "info",
        event: "ocr_completed",
        requestId,
        userId,
        imageBytes,
        mimeType: imageType,
        provider: completion.response.headers.get("cf-aig-provider"),
        model: completion.response.headers.get("cf-aig-model"),
        durationMs: Date.now() - startedAt,
        status: completion.response.status,
      })
    )
    return parsed
  } catch (error) {
    if (error instanceof AppError) throw error

    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof error.status === "number"
        ? error.status
        : null

    console.error(
      JSON.stringify({
        level: "error",
        event: "ocr_failed",
        requestId,
        userId,
        imageBytes,
        mimeType: imageType,
        durationMs: Date.now() - startedAt,
        status,
      })
    )

    if (status === 429) {
      throw new AppError(
        429,
        "rate_limited",
        "Too many OCR requests. Try again later."
      )
    }
    throw new AppError(502, "ocr_failed", "Image transcription failed")
  }
}

export async function generateFlashcardsForNote(
  db: D1Database,
  userId: string,
  noteId: string
) {
  const note = await getOwnedNote(db, userId, noteId)
  assertMaxLength(note.content, LIMITS.aiContent, "content")

  let raw = ""
  try {
    const client = createAiClient()
    const response = await client.chat.completions.create({
      model: getAiModel(),
      messages: [
        {
          role: "system",
          content:
            "You generate concise study flashcards from the user's note. Return one valid JSON object using this exact shape: {\"flashcards\":[{\"front\":\"\",\"back\":\"\"}]}. Each front and back must be a plain text string. Use the same language as the note. Use only information from the note content in the user message. If the note content is empty, too short, or unreadable, return exactly {\"flashcards\":[]}.",
        },
        {
          role: "user",
          content: note.content,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "flashcards",
          strict: true,
          schema: {
            type: "object",
            properties: {
              flashcards: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    front: { type: "string" },
                    back: { type: "string" },
                  },
                  required: ["front", "back"],
                  additionalProperties: false,
                },
              },
            },
            required: ["flashcards"],
            additionalProperties: false,
          },
        },
      },
    })
    raw = response.choices[0]?.message?.content?.trim() ?? ""
  } catch {
    console.error(
      JSON.stringify({
        level: "error",
        event: "ai_generate_flashcards_failed",
        noteId,
      })
    )
    throw new AppError(502, "ai_generation_failed", "AI generation failed")
  }

  if (!raw)
    throw new AppError(502, "ai_empty_response", "AI returned empty response")

  const parsed = flashcardResponseSchema.parse(raw)
  if (!parsed) {
    console.error(
      JSON.stringify({
        level: "error",
        event: "ai_generate_flashcards_invalid",
        noteId,
      })
    )
    throw new AppError(502, "ai_invalid_response", "Invalid AI response format")
  }
  return parsed
}

export async function generateSmartSummaryForNote(
  db: D1Database,
  userId: string,
  noteId: string
) {
  const note = await getOwnedNote(db, userId, noteId)
  assertMaxLength(note.content, LIMITS.aiContent, "content")

  let raw = ""
  try {
    const client = createAiClient()
    const response = await client.chat.completions.create({
      model: getAiModel(),
      messages: [
        {
          role: "system",
          content:
            "You generate a concise study summary from the user's note. Return one valid JSON object using this exact shape: {\"title\":\"\",\"overview\":\"\",\"sections\":[{\"heading\":\"\",\"bullets\":[\"\"]}],\"keyTakeaways\":[\"\"]}. title, overview, and section headings must be plain text strings. sections must be an array of objects. sections[].bullets must be an array of plain text strings. keyTakeaways must be an array of plain text strings. Use the same language as the note. Use only information from the note content in the user message. If the note content is empty, too short, or unreadable, return exactly {\"title\":\"\",\"overview\":\"\",\"sections\":[],\"keyTakeaways\":[]}.",
        },
        {
          role: "user",
          content: note.content,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "smart_summary",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              overview: { type: "string" },
              sections: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    heading: { type: "string" },
                    bullets: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                  required: ["heading", "bullets"],
                  additionalProperties: false,
                },
              },
              keyTakeaways: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["title", "overview", "sections", "keyTakeaways"],
            additionalProperties: false,
          },
        },
      },
    })
    raw = response.choices[0]?.message?.content?.trim() ?? ""
  } catch {
    console.error(
      JSON.stringify({
        level: "error",
        event: "ai_generate_summary_failed",
        noteId,
      })
    )
    throw new AppError(502, "ai_generation_failed", "AI generation failed")
  }

  if (!raw)
    throw new AppError(502, "ai_empty_response", "AI returned empty response")

  const parsed = smartSummaryResponseSchema.parse(raw)
  if (!parsed) {
    console.error(
      JSON.stringify({
        level: "error",
        event: "ai_generate_summary_invalid",
        noteId,
      })
    )
    throw new AppError(502, "ai_invalid_response", "Invalid AI response format")
  }
  return parsed
}










