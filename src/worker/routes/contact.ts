import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { success, validationHook } from "../http"
import { submitContactMessage } from "../services/contact"
import type { WorkerContext } from "../types"

export const contactRoutes = new Hono<WorkerContext>()

const contactBody = z.object({
  name: z.string().min(1),
  email: z.string().min(1),
  message: z.string().min(20),
  website: z.string().nullable().optional(),
})

contactRoutes.post("/", zValidator("json", contactBody, validationHook), async (c) => {
  await submitContactMessage(c.env.DB, c.req.valid("json"), c.req.header("CF-Connecting-IP") ?? "")
  return success(c)
})
