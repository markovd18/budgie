import { Database } from "@/connectors/db/db"
import { Logger } from "@/utils/logger"
import { initTRPC } from "@trpc/server"
import superjson from "superjson"
import { ZodError } from "zod"

// Avoid exporting the entire t-object
export type TrpcContext = {
  headers: Headers
  //auth: Awaited<ReturnType<typeof lucia.validateSession>>
  logger: Logger
  db: Database
}

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: TrpcContext) => {
  return {
    ...opts,
  }
}

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC
  .context<TrpcContext>()
  //.meta<{ roles?: OperatorRole[] }>()
  .create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
        },
      }
    },
  })

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory

// middlewares
const loggerMiddleware = t.middleware(({ ctx, next, path, type }) => {
  return next({ ctx: { logger: ctx.logger.child({ trpc: { path, type } }) } })
})

const authenticationMiddleware = t.middleware(async ({ ctx, next }) => {
  //if (!ctx.auth || !ctx.auth.user) {
  //  throw new TRPCError({ code: "UNAUTHORIZED" })
  //}

  //const { impersonatedById, userId: operatorUserId } = ctx.auth.session

  return next({
    ctx: {
      ...ctx,
      //logger: ctx.logger.child({ operatorUserId, impersonatedById }),
      //auth: ctx.auth,
    },
  })
})

const protectedMiddleware = authenticationMiddleware.unstable_pipe(({ next }) => {
  //const { user } = ctx.auth
  //if (meta?.roles) {
  //  if (isNil(user.role)) {
  //    throw new TRPCError({ code: "FORBIDDEN" })
  //  }

  //  const roles = new Set([...meta.roles, OperatorRole.ADMIN])
  //  if (!roles.has(user.role)) {
  //    throw new TRPCError({ code: "FORBIDDEN" })
  //  }
  //}

  return next()
})

// router & procedures
export const createTRPCRouter = t.router

export const publicProcedure = t.procedure.use(loggerMiddleware)
export const protectedProcedure = publicProcedure.use(protectedMiddleware)
