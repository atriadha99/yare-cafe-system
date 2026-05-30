import { NextRequest, NextResponse } from "next/server";
import { createRawMaterialSchema, createInventoryTransactionSchema } from "@/lib/validation";
import { InventoryService } from "@/services/inventory.service";
import { auth } from "@/lib/auth";

// Get all raw materials
export async function GET() {
  try {
    const materials = await InventoryService.getAllMaterials();
    return NextResponse.json(materials);
  } catch (error) {
    console.error("Get materials error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create new raw material
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = createRawMaterialSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues },
        { status: 400 }
      );
    }

    const material = await InventoryService.createMaterial(validation.data);
    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error("Create material error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
