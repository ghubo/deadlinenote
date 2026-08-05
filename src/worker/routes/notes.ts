import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { REVIEW_RESULTS } from "../db"
import { AppError, success, validationHook } from "../http"
import {
  createNoteForUser,
  deleteNoteForUser,
  extractTextFromImageUrl,
  generateFlashcardsForNote,
  generateSmartSummaryForNote,
  getOwnedNote,
  listNotes,
  reviewNoteForUser,
  updateNoteForUser,
} from "../services/notes"
import {
  getOwnedOcrImage,
  OCR_IMAGE_KEY_PATTERN,
  uploadOcrImage,
} from "../services/ocr-images"
import type { WorkerContext } from "../types"

export const noteRoutes = new Hono<WorkerContext>()

const createNoteBody = z.object({
  subject_id: z.string().min(1),
  title: z.string().min(1),
  content: z.string().default(""),
  tags: z.array(z.string()).optional().nullable(),
})

const updateNoteBody = z.object({
  title: z.string().min(1),
  content: z.string(),
  tags: z.array(z.string()).optional().nullable(),
})

const reviewNoteBody = z.object({
  mastery_score: z.number().min(0).max(1),
  result: z.enum([...REVIEW_RESULTS]),
})

const extractTextBody = z.object({
  imageKey: z.string().max(90).regex(OCR_IMAGE_KEY_PATTERN),
})

noteRoutes.get("/", async (c) => {
  const result = await listNotes(c.env.DB, c.get("userId"))
  return c.json(result.results)
})

noteRoutes.get("/:id", async (c) => {
  const note = await getOwnedNote(c.env.DB, c.get("userId"), c.req.param("id"))
  return c.json(note)
})

noteRoutes.post(
  "/",
  zValidator("json", createNoteBody, validationHook),
  async (c) => {
    const note = await createNoteForUser(
      c.env.DB,
      c.get("userId"),
      c.req.valid("json")
    )
    return c.json(note, 201)
  }
)

noteRoutes.put(
  "/:id",
  zValidator("json", updateNoteBody, validationHook),
  async (c) => {
    const note = await updateNoteForUser(
      c.env.DB,
      c.get("userId"),
      c.req.param("id"),
      c.req.valid("json")
    )
    return c.json(note)
  }
)

noteRoutes.delete("/:id", async (c) => {
  await deleteNoteForUser(c.env.DB, c.get("userId"), c.req.param("id"))
  return success(c)
})

noteRoutes.post(
  "/:id/review",
  zValidator("json", reviewNoteBody, validationHook),
  async (c) => {
    await reviewNoteForUser(
      c.env.DB,
      c.get("userId"),
      c.req.param("id"),
      c.req.valid("json")
    )
    return success(c)
  }
)

noteRoutes.post("/:id/generate-flashcards", async (c) => {
  const flashcards = await generateFlashcardsForNote(
    c.env.DB,
    c.get("userId"),
    c.req.param("id")
  )
  return c.json(flashcards)
})

noteRoutes.post("/:id/generate-summary", async (c) => {
  const summary = await generateSmartSummaryForNote(
    c.env.DB,
    c.get("userId"),
    c.req.param("id")
  )
  return c.json(summary)
})

noteRoutes.post("/:id/ocr-image", async (c) => {
  await getOwnedNote(c.env.DB, c.get("userId"), c.req.param("id"))

  const body = c.req.raw.body
  if (!body) {
    throw new AppError(400, "invalid_image", "Image file is required")
  }

  const result = await uploadOcrImage(
    c.env.OCR_IMAGES,
    body,
    c.req.header("Content-Type") ?? null,
    c.req.header("X-Image-Size") ?? c.req.header("Content-Length") ?? null,
    c.get("userId"),
    c.req.param("id")
  )
  return c.json(result, 201)
})

noteRoutes.post(
  "/:id/extract-text",
  zValidator("json", extractTextBody, validationHook),
  async (c) => {
    await getOwnedNote(c.env.DB, c.get("userId"), c.req.param("id"))

    const { imageKey } = c.req.valid("json")
    const image = await getOwnedOcrImage(
      c.env.OCR_IMAGES,
      imageKey,
      c.get("userId"),
      c.req.param("id")
    )
    const imageUrl = new URL(
      `/api/ocr-images/${image.key}`,
      c.req.url
    ).toString()

    try {
      return c.json(
        await extractTextFromImageUrl(
          imageUrl,
          image.bytes,
          image.mimeType,
          c.get("userId")
        )
      )
    } finally {
      c.executionCtx.waitUntil(c.env.OCR_IMAGES.delete(image.key))
    }
  }
)
