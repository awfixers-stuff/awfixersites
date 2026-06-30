import { auth } from "@awfixersites/auth/server";
import { toNextJsHandler } from "@awfixersites/auth/next-js";

export const { GET, POST, PATCH, PUT, DELETE } = toNextJsHandler(auth);
