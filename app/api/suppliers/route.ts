import { NextRequest, NextResponse } from "next/server";
import { createSupplierSchema } from "@/lib/validation";
import { SupplierService } from "@/services/supplier.service";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const suppliers = await SupplierService.getAll();
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("Get suppliers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = createSupplierSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues }, { status: 400 });
    }

    const supplier = await SupplierService.create(validation.data);
    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error("Create supplier error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
