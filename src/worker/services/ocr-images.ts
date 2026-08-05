import { AppError } from "../http"
import { LIMITS } from "./validation"

const IMAGE_TTL_MS = 10 * 60 * 1000
export const OCR_IMAGE_KEY_PATTERN =
  /^ocr-\d{13}-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:jpg|png|webp)$/

const IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const

export type OcrImageMetadata = {
  key: string
  bytes: number
  mimeType: keyof typeof IMAGE_TYPES
}

export async function uploadOcrImage(
  bucket: R2Bucket,
  body: ReadableStream,
  contentType: string | null,
  declaredLength: string | null,
  userId: string,
  noteId: string
) {
  if (!(contentType && contentType in IMAGE_TYPES)) {
    throw new AppError(
      400,
      "invalid_image",
      "File must be a JPEG, PNG, or WebP image"
    )
  }

  const bytes = Number(declaredLength)
  if (!Number.isSafeInteger(bytes) || bytes <= 0) {
    throw new AppError(400, "invalid_image", "Image file is empty")
  }
  if (bytes > LIMITS.ocrImageBytes) {
    throw new AppError(413, "image_too_large", "Image must be 5 MB or smaller")
  }

  const mimeType = contentType as keyof typeof IMAGE_TYPES
  const expiresAt = Date.now() + IMAGE_TTL_MS
  const key = `ocr-${expiresAt}-${crypto.randomUUID()}.${IMAGE_TYPES[mimeType]}`
  const fixedLengthBody = new FixedLengthStream(bytes)

  await Promise.all([
    body.pipeTo(fixedLengthBody.writable),
    bucket.put(key, fixedLengthBody.readable, {
      httpMetadata: { contentType: mimeType },
      customMetadata: {
        userId,
        noteId,
        expiresAt: String(expiresAt),
        bytes: String(bytes),
        mimeType,
      },
    }),
  ])

  return { key }
}

export async function getOwnedOcrImage(
  bucket: R2Bucket,
  key: string,
  userId: string,
  noteId: string
): Promise<OcrImageMetadata> {
  const object = await bucket.head(key)
  const metadata = object?.customMetadata
  const expiresAt = Number(metadata?.expiresAt)
  const bytes = Number(metadata?.bytes)
  const mimeType = metadata?.mimeType

  if (
    !object ||
    metadata?.userId !== userId ||
    metadata.noteId !== noteId ||
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= Date.now() ||
    !Number.isSafeInteger(bytes) ||
    bytes <= 0 ||
    !(mimeType && mimeType in IMAGE_TYPES)
  ) {
    throw new AppError(404, "not_found", "OCR image not found or expired")
  }

  return {
    key,
    bytes,
    mimeType: mimeType as keyof typeof IMAGE_TYPES,
  }
}

export function isValidOcrImageKey(key: string) {
  return OCR_IMAGE_KEY_PATTERN.test(key)
}
