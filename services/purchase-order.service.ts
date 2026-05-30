import { prisma } from "@/lib/prisma";
import { CreatePurchaseOrderInput } from "@/lib/validation";

export class PurchaseOrderService {
  static async getAll() {
    return prisma.purchaseOrder.findMany({
      include: {
        items: {
          include: { rawMaterial: true },
        },
        requestedByUser: {
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
    return prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: { rawMaterial: true },
        },
        requestedByUser: true,
        approvedByUser: true,
      },
    });
  }

  static async create(data: CreatePurchaseOrderInput, userId: string) {
    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantityRequested,
      0
    );

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber: data.poNumber,
        requestedBy: userId,
        totalAmount: totalAmount,
        notes: data.notes,
        items: {
          create: data.items.map((item) => ({
            rawMaterialId: item.rawMaterialId,
            quantityRequested: item.quantityRequested,
            unitPrice: Math.round(item.unitPrice * 100), // Store as cents
            totalPrice: Math.round(item.unitPrice * item.quantityRequested * 100),
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return po;
  }

  static async approve(id: string, userId: string, totalAmount?: number) {
    return prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedBy: userId,
        totalAmount: totalAmount ? Math.round(totalAmount * 100) : undefined,
      },
    });
  }

  static async order(id: string) {
    return prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: "ORDERED",
        orderedAt: new Date(),
      },
    });
  }

  static async receive(
    id: string,
    items: Array<{ purchaseOrderItemId: string; quantityReceived: number }>
  ) {
    // Update received quantities
    for (const item of items) {
      await prisma.purchaseOrderItem.update({
        where: { id: item.purchaseOrderItemId },
        data: {
          quantityReceived: item.quantityReceived,
        },
      });
    }

    // Update inventory
    const poItems = await prisma.purchaseOrderItem.findMany({
      where: { purchaseOrderId: id },
      include: { rawMaterial: true },
    });

    for (const item of poItems) {
      if (item.quantityReceived > 0) {
        // Create inventory transaction
        await prisma.inventoryTransaction.create({
          data: {
            rawMaterialId: item.rawMaterialId,
            type: "in",
            quantity: item.quantityReceived,
            reason: `Received from PO: ${id}`,
            referenceId: id,
            referenceType: "purchase_order",
            performedBy: "system", // Should be passed from context
          },
        });

        // Update raw material stock
        await prisma.rawMaterial.update({
          where: { id: item.rawMaterialId },
          data: {
            stock: {
              increment: item.quantityReceived,
            },
          },
        });
      }
    }

    // Update PO status
    return prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: "RECEIVED",
        receivedAt: new Date(),
      },
    });
  }

  static async cancel(id: string) {
    return prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    });
  }

  static async getPOByStatus(status: string) {
    return prisma.purchaseOrder.findMany({
      where: { status: status as any },
      include: {
        items: { include: { rawMaterial: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getPendingApprovals() {
    return prisma.purchaseOrder.findMany({
      where: { status: "PENDING" },
      include: {
        items: { include: { rawMaterial: true } },
        requestedByUser: { select: { id: true, name: true } },
      },
    });
  }
}
