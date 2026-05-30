import { prisma } from "@/lib/prisma";
import { CreateRawMaterialInput, CreateInventoryTransactionInput } from "@/lib/validation";

export class InventoryService {
  static async getAllMaterials() {
    return prisma.rawMaterial.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  static async getMaterialById(id: string) {
    return prisma.rawMaterial.findUnique({
      where: { id },
    });
  }

  static async createMaterial(data: CreateRawMaterialInput) {
    return prisma.rawMaterial.create({
      data: {
        sku: data.sku,
        name: data.name,
        unit: data.unit,
        unitCost: Math.round(data.unitCost * 100), // Store as cents
        minStock: data.minStock || 0,
      },
    });
  }

  static async updateMaterial(id: string, data: Partial<CreateRawMaterialInput>) {
    return prisma.rawMaterial.update({
      where: { id },
      data: {
        sku: data.sku,
        name: data.name,
        unit: data.unit,
        unitCost: data.unitCost ? Math.round(data.unitCost * 100) : undefined,
        minStock: data.minStock,
      },
    });
  }

  static async deleteMaterial(id: string) {
    return prisma.rawMaterial.delete({
      where: { id },
    });
  }

  // Inventory transactions
  static async getAllTransactions() {
    return prisma.inventoryTransaction.findMany({
      include: {
        rawMaterial: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getTransactionsByMaterial(materialId: string) {
    return prisma.inventoryTransaction.findMany({
      where: { rawMaterialId: materialId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createTransaction(
    data: CreateInventoryTransactionInput,
    userId: string
  ) {
    const transaction = await prisma.inventoryTransaction.create({
      data: {
        rawMaterialId: data.rawMaterialId,
        type: data.type,
        quantity: data.quantity,
        reason: data.reason,
        referenceId: data.referenceId,
        referenceType: data.referenceType || "manual",
        performedBy: userId,
      },
      include: {
        rawMaterial: true,
      },
    });

    // Update raw material stock
    if (data.type === "in") {
      await prisma.rawMaterial.update({
        where: { id: data.rawMaterialId },
        data: {
          stock: {
            increment: data.quantity,
          },
        },
      });
    } else if (data.type === "out" || data.type === "adjustment") {
      await prisma.rawMaterial.update({
        where: { id: data.rawMaterialId },
        data: {
          stock: {
            decrement: data.quantity,
          },
        },
      });
    }

    return transaction;
  }

  // Get low stock items
  static async getLowStockItems() {
    return prisma.rawMaterial.findMany({
      where: {
        stock: {
          lte: prisma.rawMaterial.fields.minStock,
        },
      },
      orderBy: { stock: "asc" },
    });
  }

  // Get stock summary
  static async getStockSummary() {
    const materials = await prisma.rawMaterial.findMany();
    const totalValue = materials.reduce(
      (sum, mat) => sum + mat.stock * mat.unitCost,
      0
    );
    const lowStockCount = materials.filter(
      (m) => m.stock <= m.minStock
    ).length;

    return {
      totalItems: materials.length,
      totalValue: totalValue / 100, // Convert from cents
      lowStockCount,
      materials,
    };
  }
}
