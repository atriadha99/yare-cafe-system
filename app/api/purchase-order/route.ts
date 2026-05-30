import { NextRequest, NextResponse } from "next/server";
import { createPurchaseOrderSchema } from "@/lib/validation";
import { PurchaseOrderService } from "@/services/purchase-order.service";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const pos = await PurchaseOrderService.getAll();
    return NextResponse.json(pos);
  } catch (error) {
    console.error("Get purchase orders error:", error);
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
    const validation = createPurchaseOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues },
        { status: 400 }
      );
    }

    const po = await PurchaseOrderService.create(validation.data, session.user.id);
    return NextResponse.json(po, { status: 201 });
  } catch (error) {
    console.error("Create purchase order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
