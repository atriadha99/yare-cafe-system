import { NextRequest, NextResponse } from "next/server";
import { createInventoryTransactionSchema } from "@/lib/validation";
import { InventoryService } from "@/services/inventory.service";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const transactions = await InventoryService.getAllTransactions();
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Get transactions error:", error);
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
    const validation = createInventoryTransactionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues },
        { status: 400 }
      );
    }

    const transaction = await InventoryService.createTransaction(
      validation.data,
      session.user.id
    );

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Create transaction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
