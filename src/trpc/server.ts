import "server-only"

import { headers } from "next/headers"
import { cache } from "react"

//import { validateRequest } from "@/helpers/auth/lucia"
import { createCaller } from "@/server/api/root"
import { createTRPCContext } from "@/server/api/trpc"
import { mainLogger } from "@/utils/logger"
import { db } from "@/connectors/db/db"

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(headers())
  heads.set("x-trpc-source", "rsc")

  return createTRPCContext({
    headers: heads,
    logger: mainLogger.child({}),
    db: db,
    //auth: await validateRequest(),
  })
})

export const api = createCaller(createContext)
