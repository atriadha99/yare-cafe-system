import { prisma } from "@/lib/prisma";
import { CreateStockOpnameInput } from "@/lib/validation";

export class StockOpnameService {
  static async getAll() {
    return prisma.stockOpname.findMany({
      include: {
        items: {
          include: { rawMaterial: true },
        },
        performedByUser: {
          select: { id: true, name: true, email: true },
        },
        approvedByUser: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string) {
    return prisma.stockOpname.findUnique({
      where: { id },
      include: {
        items: {
          include: { rawMaterial: true },
        },
        performedByUser: true,
        approvedByUser: true,
      },
    });
  }

  static async create(data: CreateStockOpnameInput, userId: string) {
    const opnameNumber = `SO-${Date.now()}`;

    const opname = await prisma.stockOpname.create({
      data: {
        opnameNumber,
        performedBy: userId,
        notes: data.notes,
        status: "DRAFT",
        items: {
          create: data.items.map((item) => ({
            rawMaterialId: item.rawMaterialId,
            systemStock: item.systemStock,
            actualStock: item.actualStock,
            notes: item.notes,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return opname;
  }

  static async complete(id: string) {
    return prisma.stockOpname.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });
  }

  static async approve(id: string, userId: string) {
    const opname = await prisma.stockOpname.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!opname) throw new Error("Stock opname not found");

    // Apply adjustments
    for (const item of opname.items) {
      const diff = item.difference; // difference = actual - system

      if (diff !== 0) {
        // Create inventory transaction for the difference
        await prisma.inventoryTransaction.create({
          data: {
            rawMaterialId: item.rawMaterialId,
            type: "adjustment",
            quantity: Math.abs(diff),
            reason: `Stock opname adjustment - Opname #${opname.opnameNumber}`,
            referenceId: id,
            referenceType: "stock_opname",
            performedBy: userId,
          },
        });

        // Update raw material stock to actual stock
        await prisma.rawMaterial.update({
          where: { id: item.rawMaterialId },
          data: {
            stock: item.actualStock,
          },
        });
      }
    }

    // Update opname status
    return prisma.stockOpname.update({
      where: { id },
      data: {
        status: "ADJUSTED",
        approvedBy: userId,
      },
    });
  }

  static async getDraftOpnames() {
    return prisma.stockOpname.findMany({
      where: { status: "DRAFT" },
      include: { items: { include: { rawMaterial: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getPendingApprovals() {
    return prisma.stockOpname.findMany({
      where: { status: "COMPLETED", approvedBy: null },
      include: {
        items: { include: { rawMaterial: true } },
        performedByUser: { select: { id: true, name: true } },
      },
    });
  }

  static async getOpnameHistory() {
    return prisma.stockOpname.findMany({
      where: { status: "ADJUSTED" },
      include: {
        items: { include: { rawMaterial: true } },
      },
      orderBy: { completedAt: "desc" },
    });
  }
}
