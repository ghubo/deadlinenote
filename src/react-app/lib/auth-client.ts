import { createAuthClient } from "better-auth/react"
import { sentinelClient } from "@better-auth/infra/client";
import { queryClient } from "./query-client"

export const authClient = createAuthClient({
  baseURL: window.location.origin,
  plugins: [
    sentinelClient()
  ]
})

export const { useSession, signIn, signUp } = authClient

export function signOut() {
  return authClient.signOut({
    fetchOptions: {
      onSuccess() {
        queryClient.clear()
        try {
          window.localStorage.removeItem("dn_pomo")
        } catch {
          // Storage can be unavailable in hardened browser settings.
        }
      },
    },
  })
}
