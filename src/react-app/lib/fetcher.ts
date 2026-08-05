export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message)
  }
}

export async function fetcher<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers)
  if (
    options?.body != null &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json")
  }

  const res = await fetch(`/api${path}`, {
    ...options,
    credentials: "include",
    headers,
  })
  if (!res.ok) {
    const text = await res.text()
    try {
      const parsed = JSON.parse(text) as { code?: unknown; message?: unknown; error?: unknown }
      throw new ApiError(
        res.status,
        typeof parsed.code === "string" ? parsed.code : "request_failed",
        typeof parsed.message === "string"
          ? parsed.message
          : typeof parsed.error === "string"
          ? parsed.error
          : "Request failed"
      )
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(res.status, "request_failed", text || "Request failed")
    }
  }
  return res.json() as Promise<T>
}
