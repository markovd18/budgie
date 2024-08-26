import { isAxiosError } from "axios"
import { minimatch } from "minimatch"
import pino, { Level, LoggerOptions } from "pino"
import env from "./env.mjs"

function getLogLevel(level?: string | undefined | null): Level {
  if (!level) {
    return "info"
  }

  switch (level.toLowerCase()) {
    case "fatal":
      return "fatal"
    case "error":
      return "error"
    case "warn":
      return "warn"
    default:
    case "info":
      return "info"
    case "debug":
      return "debug"
    case "trace":
      return "trace"
  }
}

const errorSerializer = pino.stdSerializers.wrapErrorSerializer((error) => {
  if (isAxiosError(error.raw)) {
    // only keep the basic error properties - axios includes lot of junk that should not be logged
    return {
      message: error.message,
      stack: error.stack,
      type: error.type,
      response: {
        body: error.raw.response?.data,
        headers: error.raw.response?.headers,
        status: error.raw.response?.status,
        statusText: error.raw.response?.statusText,
      },
    }
  }

  return error
})

const reqSerializer = pino.stdSerializers.wrapRequestSerializer((req) => {
  const headers = { ...req.headers }

  // NOTE: fastify (and node http module) converts all headers to lowercase
  // more info here: https://github.com/fastify/help/issues/71#issuecomment-482136803
  if ("authorization" in headers) {
    headers["authorization"] = "<REDACTED>"
  }

  if ("x-api-key" in headers) {
    headers["x-api-key"] = "<REDACTED>"
  }

  return { ...req, headers }
})

function extractName(currentArgs: unknown, parentArgs: unknown) {
  if (currentArgs && typeof currentArgs === "object" && "name" in currentArgs) {
    return currentArgs.name
  }

  if (parentArgs && typeof parentArgs === "object" && "name" in parentArgs) {
    return parentArgs.name
  }

  return undefined
}

function shouldLogBePrinted(name: string, filter: string) {
  // we want to match the name exactly or with colon at the end
  const alternativeName = `${name}:`
  return minimatch(name, filter) || minimatch(alternativeName, filter)
}

type Opts = {
  logLevel?: string
  pretty?: boolean
  extraOptions?: Omit<LoggerOptions, "level" | "formatters" | "serializers">
  filter?: string
}

export function createLogger(opts?: Opts) {
  const level = getLogLevel(opts?.logLevel ?? "info")

  const options: LoggerOptions = {
    ...opts?.extraOptions,
    level,
    formatters: { level: (level) => ({ level }) },
    serializers: {
      err: errorSerializer,
      error: errorSerializer,
      req: reqSerializer,
      res: pino.stdSerializers.res,
    },
    hooks: {
      logMethod(inputArgs, method) {
        const { filter } = opts ?? {}

        // if no filter is set, just log everything
        if (!filter || filter === "*") {
          return method.apply(this, inputArgs)
        }

        const name = extractName(inputArgs[0], this.bindings())
        if (typeof name !== "string") {
          return
        }

        // match name like debug npm package
        if (!shouldLogBePrinted(name, filter)) {
          return
        }

        return method.apply(this, inputArgs)
      },
    },
  }

  if (opts?.pretty) {
    return pino(
      options,
      pino.transport({
        target: "pino-pretty",
        options: { colorize: true },
      }),
    )
  }

  return pino(options)
}

export const mainLogger = createLogger({
  // TODO: there are some problem with pino-pretty and nextjs
  pretty: false,
  logLevel: env.LOG_LEVEL,
})

export type Logger = ReturnType<typeof createLogger>
