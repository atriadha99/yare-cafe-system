import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validation";
import { UserService } from "@/services/user.service";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await UserService.getByEmail(validation.data.email);
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const user = await UserService.create(
      validation.data.name,
      validation.data.email,
      validation.data.password
    );

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
