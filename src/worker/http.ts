import type { Context } from "hono"
import type { WorkerContext } from "./types"
import type { Hook } from "@hono/zod-validator"
import type { ContentfulStatusCode } from "hono/utils/http-status"

export type ErrorCode =
  | "bad_request"
  | "unauthorized"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "invalid_image"
  | "image_too_large"
  | "ocr_no_text"
  | "ocr_failed"
  | "ai_generation_failed"
  | "ai_empty_response"
  | "ai_invalid_response"
  | "internal_error"

export class AppError extends Error {
  constructor(
    public status: number,
    public code: ErrorCode,
    message: string
  ) {
    super(message)
  }
}

export function apiError(c: Context<WorkerContext>, error: AppError) {
  return c.json(
    { code: error.code, message: error.message },
    error.status as ContentfulStatusCode
  )
}

export function badRequest(c: Context<WorkerContext>, message: string) {
  return apiError(c, new AppError(400, "bad_request", message))
}

export function unauthorized(c: Context<WorkerContext>, message = "Unauthorized") {
  return apiError(c, new AppError(401, "unauthorized", message))
}

export function notFound(c: Context<WorkerContext>, message = "Not found") {
  return apiError(c, new AppError(404, "not_found", message))
}

export function success(c: Context<WorkerContext>) {
  return c.json({ success: true })
}

export const validationHook: Hook<any, any, any, any> = (result, c) => {
  if (result.success) return
  const issue = result.error.issues[0]
  return badRequest(c, issue?.message ?? "Invalid request body")
}
