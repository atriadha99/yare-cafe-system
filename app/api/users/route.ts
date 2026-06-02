import { NextResponse } from "next/server";
import { UserService } from "@/services/user.service";

export async function GET() {
  try {
    const users = await UserService.getAll();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}
