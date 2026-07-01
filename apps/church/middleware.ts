import { createAppSecurityMiddleware } from "@awfixersites/security/middleware";
import { NextRequest, NextResponse } from "next/server";

import { arcjet } from "@/lib/security";

const middleware = arcjet
  ? createAppSecurityMiddleware(arcjet)
  : function passthrough(_request: NextRequest) {
      return NextResponse.next();
    };

export default middleware;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
