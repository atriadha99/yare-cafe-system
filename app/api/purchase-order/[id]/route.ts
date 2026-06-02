import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PurchaseOrderService } from "@/services/purchase-order.service";
import { approvePurchaseOrderSchema, receivePurchaseOrderSchema } from "@/lib/validation";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const po = await PurchaseOrderService.getById(params.id);
    if (!po) {
      return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
    }
    return NextResponse.json(po);
  } catch (error) {
    console.error("Get purchase order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const action = body.action as string;
    let result;

    switch (action) {
      case "approve": {
        const validation = approvePurchaseOrderSchema.safeParse(body);
        if (!validation.success) {
          return NextResponse.json({ error: validation.error.issues }, { status: 400 });
        }
        result = await PurchaseOrderService.approve(params.id, session.user.id, validation.data.totalAmount);
        break;
      }
      case "order": {
        result = await PurchaseOrderService.order(params.id);
        break;
      }
      case "receive": {
        const validation = receivePurchaseOrderSchema.safeParse(body);
        if (!validation.success) {
          return NextResponse.json({ error: validation.error.issues }, { status: 400 });
        }
        result = await PurchaseOrderService.receive(params.id, validation.data.items, session.user.id);
        break;
      }
      case "cancel": {
        result = await PurchaseOrderService.cancel(params.id);
        break;
      }
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Update purchase order status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
