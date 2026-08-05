export const COLOR_OPTIONS = ["blue","red","green","purple","orange","teal","pink","yellow"] as const
export type SubjectColor = typeof COLOR_OPTIONS[number]

export const colorMap: Record<SubjectColor, { bg: string; text: string; dot: string; border: string }> = {
  blue:   { bg: "bg-blue-100 dark:bg-blue-950/40",   text: "text-blue-700 dark:text-blue-300",   dot: "bg-blue-400",   border: "border-blue-300 dark:border-blue-900/50"   },
  red:    { bg: "bg-red-100 dark:bg-red-950/40",    text: "text-red-700 dark:text-red-300",    dot: "bg-red-400",    border: "border-red-300 dark:border-red-900/50"    },
  green:  { bg: "bg-green-100 dark:bg-green-950/40",  text: "text-green-700 dark:text-green-300",  dot: "bg-green-400",  border: "border-green-300 dark:border-green-900/50"  },
  purple: { bg: "bg-purple-100 dark:bg-purple-950/40", text: "text-purple-700 dark:text-purple-300", dot: "bg-purple-400", border: "border-purple-300 dark:border-purple-900/50" },
  orange: { bg: "bg-orange-100 dark:bg-orange-950/40", text: "text-orange-700 dark:text-orange-300", dot: "bg-orange-400", border: "border-orange-300 dark:border-orange-900/50" },
  teal:   { bg: "bg-teal-100 dark:bg-teal-950/40",   text: "text-teal-700 dark:text-teal-300",   dot: "bg-teal-400",   border: "border-teal-300 dark:border-teal-900/50"   },
  pink:   { bg: "bg-pink-100 dark:bg-pink-950/40",   text: "text-pink-700 dark:text-pink-300",   dot: "bg-pink-400",   border: "border-pink-300 dark:border-pink-900/50"   },
  yellow: { bg: "bg-yellow-100 dark:bg-yellow-950/40", text: "text-yellow-700 dark:text-yellow-300", dot: "bg-yellow-400", border: "border-yellow-300 dark:border-yellow-900/50" },
}

export function getColor(color: string) {
  return colorMap[(color as SubjectColor)] ?? colorMap.blue
}
