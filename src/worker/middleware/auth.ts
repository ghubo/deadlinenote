import { createMiddleware } from "hono/factory"
import { auth } from "../lib/auth"
import { unauthorized } from "../http"
import type { WorkerContext } from "../types"

export const authMiddleware = createMiddleware<WorkerContext>(
  async (c, next) => {
    if (c.req.path.startsWith("/api/auth")) {
      return await next()
    }

    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    })

    if (!session) {
      return unauthorized(c)
    }

    c.set("userId", session.user.id)
    await next()
  }
)
