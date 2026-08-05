/**
 * PBKDF2 password hashing for better-auth on Cloudflare Workers (free tier).
 *
 * Uses the Web Crypto API (crypto.subtle) — native C++ implementation,
 * significantly faster than pure-JS but still counts toward CPU time.
 *
 * Tune ITERATIONS to fit your CPU budget:
 *   ~10 000 → ~3ms   (good balance for Workers free tier)
 *   ~50 000 → ~10ms  (near the free-tier ceiling, similar to bcrypt cost 10)
 *
 * ⚠️  Do NOT go below 10_000 — lower values are crackable in seconds on commodity hardware.
 *
 * The encoded format is:  pbkdf2:<iterations>:<salt_hex>:<hash_hex>
 */

const ALGORITHM = "SHA-256"
const KEY_LENGTH_BITS = 256
const SALT_BYTES = 16
const ITERATIONS = 10_000 // adjust as needed — see notes above

// ─── helpers ────────────────────────────────────────────────────────────────

function bufToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

function hexToBuf(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2)
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return arr
}

async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number
): Promise<Uint8Array> {
  const enc = new TextEncoder()
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password.normalize("NFKC")),
    "PBKDF2",
    false,
    ["deriveBits"]
  )
  const buf = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: ALGORITHM, salt, iterations },
    baseKey,
    KEY_LENGTH_BITS
  )
  return new Uint8Array(buf)
}

// ─── stored hash parsing ─────────────────────────────────────────────────────

interface StoredHash {
  iterations: number
  salt: Uint8Array
  hash: Uint8Array
}

function parseStoredHash(stored: string): StoredHash | null {
  const parts = stored.split(":")
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return null

  const iterations = parseInt(parts[1], 10)
  if (!Number.isFinite(iterations) || iterations < 1) return null

  if (parts[2].length !== SALT_BYTES * 2) return null
  if (parts[3].length !== (KEY_LENGTH_BITS / 8) * 2) return null

  return {
    iterations,
    salt: hexToBuf(parts[2]),
    hash: hexToBuf(parts[3]),
  }
}

// ─── public API ─────────────────────────────────────────────────────────────

/**
 * Hash a plain-text password.
 * Returns an opaque string you can store in your database.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const hash = await deriveKey(password, salt, ITERATIONS)
  return `pbkdf2:${ITERATIONS}:${bufToHex(salt)}:${bufToHex(hash)}`
}

/**
 * Verify a plain-text password against a stored hash.
 * Uses a constant-time comparison to prevent timing attacks.
 */
export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const parsed = parseStoredHash(stored)
  if (!parsed) return false

  const actualHash = await deriveKey(password, parsed.salt, parsed.iterations)

  if (actualHash.length !== parsed.hash.length) return false
  let diff = 0
  for (let i = 0; i < actualHash.length; i++) {
    diff |= actualHash[i] ^ parsed.hash[i]
  }
  return diff === 0
}

// ─── better-auth adapter ────────────────────────────────────────────────────

/**
 * Drop this object into better-auth's `emailAndPassword` option:
 *
 *   import { betterAuth } from "better-auth";
 *   import { pbkdf2Password } from "./pbkdf2";
 *
 *   export const auth = betterAuth({
 *     emailAndPassword: {
 *       enabled: true,
 *       password: pbkdf2Password,
 *     },
 *   });
 */
export const pbkdf2Password = {
  hash: hashPassword,
  verify: ({
    hash,
    password,
  }: {
    hash: string
    password: string
  }): Promise<boolean> => verifyPassword(password, hash),
}
