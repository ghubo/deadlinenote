import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { success, validationHook } from "../http"
import {
  createSubjectForUser,
  deleteSubjectForUser,
  listSubjects,
  updateSubjectForUser,
} from "../services/subjects"
import type { WorkerContext } from "../types"

export const subjectRoutes = new Hono<WorkerContext>()

const subjectBody = z.object({
  name: z.string().min(1),
  color: z.string().min(1).default("blue"),
  semester: z.string().nullable().optional(),
})

subjectRoutes.get("/", async (c) => {
  const result = await listSubjects(c.env.DB, c.get("userId"))
  return c.json(result.results)
})

subjectRoutes.post("/", zValidator("json", subjectBody, validationHook), async (c) => {
  const subject = await createSubjectForUser(c.env.DB, c.get("userId"), c.req.valid("json"))
  return c.json(subject, 201)
})

subjectRoutes.put("/:id", zValidator("json", subjectBody, validationHook), async (c) => {
  const subject = await updateSubjectForUser(
    c.env.DB,
    c.get("userId"),
    c.req.param("id"),
    c.req.valid("json")
  )
  return c.json(subject)
})

subjectRoutes.delete("/:id", async (c) => {
  await deleteSubjectForUser(c.env.DB, c.get("userId"), c.req.param("id"))
  return success(c)
})
