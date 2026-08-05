import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { success, validationHook } from "../http"
import {
  completeSessionForUser,
  createSessionForUser,
  deleteSessionForUser,
  listSessions,
} from "../services/sessions"
import type { WorkerContext } from "../types"

export const sessionRoutes = new Hono<WorkerContext>()

const createSessionBody = z.object({
  note_id: z.string().nullable().optional(),
  subject_id: z.string().nullable().optional(),
  duration_minutes: z.number().int().nullish().transform((v) => v ?? 25),
})

sessionRoutes.get("/", async (c) => {
  const result = await listSessions(c.env.DB, c.get("userId"))
  return c.json(result.results)
})

sessionRoutes.post("/", zValidator("json", createSessionBody, validationHook), async (c) => {
  const session = await createSessionForUser(c.env.DB, c.get("userId"), c.req.valid("json"))
  return c.json(session, 201)
})

sessionRoutes.put("/:id/complete", async (c) => {
  await completeSessionForUser(c.env.DB, c.get("userId"), c.req.param("id"))
  return success(c)
})

sessionRoutes.delete("/:id", async (c) => {
  await deleteSessionForUser(c.env.DB, c.get("userId"), c.req.param("id"))
  return success(c)
})
