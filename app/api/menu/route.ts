import { NextRequest, NextResponse } from "next/server";
import { createMenuSchema, updateMenuSchema } from "@/lib/validation";
import { MenuService } from "@/services/menu.service";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const menus = await MenuService.getAll();
    return NextResponse.json(menus);
  } catch (error) {
    console.error("Get menus error:", error);
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
    const validation = createMenuSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues },
        { status: 400 }
      );
    }

    const menu = await MenuService.create(validation.data);
    return NextResponse.json(menu, { status: 201 });
  } catch (error) {
    console.error("Create menu error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
