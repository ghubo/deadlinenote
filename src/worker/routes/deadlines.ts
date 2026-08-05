import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { success, validationHook } from "../http"
import { DEADLINE_TYPES } from "../db"
import {
  createDeadlineForUser,
  deleteDeadlineForUser,
  listDeadlines,
  updateDeadlineCompletionForUser,
  updateDeadlineForUser,
} from "../services/deadlines"
import type { WorkerContext } from "../types"

export const deadlineRoutes = new Hono<WorkerContext>()

const deadlineBody = z.object({
  subject_id: z.string().min(1),
  title: z.string().min(1),
  type: z.enum([...DEADLINE_TYPES]),
  due_date: z.number().int().positive(),
})

const completionBody = z.object({
  completed: z.boolean(),
})

deadlineRoutes.get("/", async (c) => {
  const result = await listDeadlines(c.env.DB, c.get("userId"))
  return c.json(result.results)
})

deadlineRoutes.post("/", zValidator("json", deadlineBody, validationHook), async (c) => {
  const deadline = await createDeadlineForUser(c.env.DB, c.get("userId"), c.req.valid("json"))
  return c.json(deadline, 201)
})

deadlineRoutes.put("/:id", zValidator("json", deadlineBody, validationHook), async (c) => {
  const deadline = await updateDeadlineForUser(
    c.env.DB,
    c.get("userId"),
    c.req.param("id"),
    c.req.valid("json")
  )
  return c.json(deadline)
})

deadlineRoutes.patch("/:id/completion", zValidator("json", completionBody, validationHook), async (c) => {
  const deadline = await updateDeadlineCompletionForUser(
    c.env.DB,
    c.get("userId"),
    c.req.param("id"),
    c.req.valid("json").completed
  )
  return c.json(deadline)
})

deadlineRoutes.delete("/:id", async (c) => {
  await deleteDeadlineForUser(c.env.DB, c.get("userId"), c.req.param("id"))
  return success(c)
})
