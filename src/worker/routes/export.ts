import { Hono } from "hono"
import { getExportData } from "../services/export"
import type { WorkerContext } from "../types"

export const exportRoutes = new Hono<WorkerContext>()

exportRoutes.get("/", async (c) => {
  const exportData = await getExportData(c.env.DB, c.get("userId"))
  const filename = `deadlinenote-${new Date().toISOString().slice(0, 10)}.json`

  return new Response(JSON.stringify(exportData), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
})
