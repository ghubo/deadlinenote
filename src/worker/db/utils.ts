export function generateId(): string {
  return crypto.randomUUID()
}

export function nowUnix(): number {
  return Math.floor(Date.now() / 1000)
}

export function didChange(result: D1Result | D1Response): boolean {
  return result.meta.changes > 0
}
