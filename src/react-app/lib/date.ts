export function dateInputToUnix(dateInput: string) {
  const [year, month, day] = dateInput.split("-").map(Number)
  if (!year || !month || !day) return 0
  return Math.floor(new Date(year, month - 1, day).getTime() / 1000)
}

export function unixToDateInput(unixSeconds: number) {
  const date = new Date(unixSeconds * 1000)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function timezoneOffsetQuery() {
  return `tzOffset=${encodeURIComponent(String(new Date().getTimezoneOffset()))}`
}
