import { NextRequest, NextResponse } from "next/server";
import { StockOpnameService } from "@/services/stock-opname.service";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const opnames = await StockOpnameService.getAll();
    return NextResponse.json(opnames);
  } catch (error) {
    console.error("Get stock opnames error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const opname = await StockOpnameService.create(body, session.user.id);
    return NextResponse.json(opname, { status: 201 });
  } catch (error) {
    console.error("Create stock opname error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
