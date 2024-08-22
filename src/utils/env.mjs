// @ts-check
import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    ENVIRONMENT: z.string(),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),

    DATABASE_URL: z.string().url(),
    DATABASE_TOKEN: z.string(),
  },
  client: {},
  experimental__runtimeEnv: {
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
  },
})

export function isProd() {
  return env.ENVIRONMENT === "production"
}

export function isDev() {
  return env.ENVIRONMENT === "development"
}

export function isLocal() {
  return env.ENVIRONMENT === "local"
}

export default env
