import { Hono } from "hono"
import type { WorkerContext } from "../types"
import { isValidOcrImageKey } from "../services/ocr-images"

export const ocrImageRoutes = new Hono<WorkerContext>()

ocrImageRoutes.get("/:key", async (c) => {
  const key = c.req.param("key")
  if (!isValidOcrImageKey(key)) return c.notFound()

  const object = await c.env.OCR_IMAGES.get(key)
  const expiresAt = Number(object?.customMetadata?.expiresAt)
  if (!object || !Number.isSafeInteger(expiresAt) || expiresAt <= Date.now()) {
    if (object) c.executionCtx.waitUntil(c.env.OCR_IMAGES.delete(key))
    return c.notFound()
  }

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set("ETag", object.httpEtag)
  headers.set("Cache-Control", "private, no-store")
  headers.set("X-Content-Type-Options", "nosniff")
  return new Response(object.body, { headers })
})
