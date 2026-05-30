import { auth } from "./auth";
import { NextResponse } from "next/server";

export async function withAuth(
  callback: (req: any, session: any) => Promise<NextResponse>
) {
  return async (req: any) => {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return callback(req, session);
  };
}

export function requireRole(allowedRoles: string[]) {
  return (session: any) => {
    if (!allowedRoles.includes(session?.user?.role)) {
      throw new Error("Forbidden");
    }
  };
}
