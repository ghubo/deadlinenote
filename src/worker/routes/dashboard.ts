import { Hono } from "hono"
import { getDashboardData } from "../services/dashboard"
import type { WorkerContext } from "../types"

export const dashboardRoutes = new Hono<WorkerContext>()

dashboardRoutes.get("/", async (c) => {
  const timezoneOffset = Number(c.req.query("tzOffset") ?? 0)
  const data = await getDashboardData(
    c.env.DB,
    c.get("userId"),
    Number.isFinite(timezoneOffset) ? timezoneOffset : 0
  )
  return c.json(data)
})
