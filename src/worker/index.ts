import { Hono } from "hono"
import { auth } from "./lib/auth"
import { AppError, apiError } from "./http"

import { dashboardRoutes } from "./routes/dashboard"
import { noteRoutes } from "./routes/notes"
import { subjectRoutes } from "./routes/subjects"
import { deadlineRoutes } from "./routes/deadlines"
import { sessionRoutes } from "./routes/sessions"
import { contactRoutes } from "./routes/contact"
import { exportRoutes } from "./routes/export"
import { authMiddleware } from "./middleware/auth"
import { ocrImageRoutes } from "./routes/ocr-images"

import type { WorkerContext } from "./types"

const app = new Hono<WorkerContext>()

app.onError((error, c) => {
  if (error instanceof AppError) {
    return apiError(c, error)
  }
  console.error(JSON.stringify({
    level: "error",
    event: "unhandled_api_error",
    path: c.req.path,
    message: error.message,
  }))
  return apiError(c, new AppError(500, "internal_error", "Internal server error"))
})

// Auth routes handled by Better Auth
app.on(["POST", "GET"], "/api/auth/**", (c) => {
  return auth.handler(c.req.raw)
})

// Public routes (no auth required)
app.route("/api/contact", contactRoutes)
app.route("/api/ocr-images", ocrImageRoutes)

// Protect all other /api/* routes
app.use("/api/*", authMiddleware)

app.route("/api/dashboard", dashboardRoutes)
app.route("/api/notes", noteRoutes)
app.route("/api/subjects", subjectRoutes)
app.route("/api/deadlines", deadlineRoutes)
app.route("/api/sessions", sessionRoutes)
app.route("/api/export", exportRoutes)

export default app
