import { env } from "cloudflare:workers"
import { betterAuth } from "better-auth"
import { dash } from "@better-auth/infra"
import { sentinel } from "@better-auth/infra"
import { pbkdf2Password } from "./pbkdf2"

export const auth = betterAuth({
  appName: "DeadlineNote",
  secret: env.BETTER_AUTH_SECRET,
  baseURL: {
    allowedHosts: ["localhost:5173", "127.0.0.1:5173"],
  },
  database: env.DB,
  emailAndPassword: {
    enabled: true,
    password: pbkdf2Password,
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["cf-connecting-ip"], // Cloudflare specific header example
    },
  },
  plugins: [
    dash(),
    sentinel(),
  ],
  experimental: {
    joins: true, // Enable database joins for better performance
  },
})
