import { prisma } from "@/lib/prisma";
import { CreateMenuInput, UpdateMenuInput } from "@/lib/validation";

export class MenuService {
  static async getAll() {
    return prisma.menu.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string) {
    return prisma.menu.findUnique({
      where: { id },
      include: {
        productIngredients: {
          include: { rawMaterial: true },
        },
      },
    });
  }

  static async create(data: CreateMenuInput) {
    return prisma.menu.create({
      data: {
        name: data.name,
        price: Math.round(data.price * 100), // Store as cents
        stock: data.stock || 0,
        image: data.image,
      },
    });
  }

  static async update(id: string, data: Partial<CreateMenuInput>) {
    return prisma.menu.update({
      where: { id },
      data: {
        name: data.name,
        price: data.price ? Math.round(data.price * 100) : undefined,
        stock: data.stock,
        image: data.image,
      },
    });
  }

  static async delete(id: string) {
    return prisma.menu.delete({
      where: { id },
    });
  }

  static async linkIngredient(
    menuId: string,
    rawMaterialId: string,
    quantityNeeded: number
  ) {
    return prisma.productIngredient.create({
      data: {
        menuId,
        rawMaterialId,
        quantityNeeded,
      },
    });
  }

  static async unlinkIngredient(menuId: string, rawMaterialId: string) {
    return prisma.productIngredient.delete({
      where: {
        menuId_rawMaterialId: { menuId, rawMaterialId },
      },
    });
  }

  static async checkAvailability(menuId: string): Promise<boolean> {
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        productIngredients: {
          include: { rawMaterial: true },
        },
      },
    });

    if (!menu) return false;

    // Check if all ingredients have sufficient stock
    for (const ingredient of menu.productIngredients) {
      if (ingredient.rawMaterial.stock < ingredient.quantityNeeded) {
        return false;
      }
    }

    return true;
  }

  static async consumeIngredients(menuId: string) {
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        productIngredients: {
          include: { rawMaterial: true },
        },
      },
    });

    if (!menu) throw new Error("Menu not found");

    // Start transaction
    for (const ingredient of menu.productIngredients) {
      // Create inventory transaction
      await prisma.inventoryTransaction.create({
        data: {
          rawMaterialId: ingredient.rawMaterialId,
          type: "out",
          quantity: ingredient.quantityNeeded,
          reason: `Used for menu: ${menu.name}`,
          referenceType: "manual",
        },
      });

      // Update raw material stock
      await prisma.rawMaterial.update({
        where: { id: ingredient.rawMaterialId },
        data: {
          stock: {
            decrement: ingredient.quantityNeeded,
          },
        },
      });
    }
  }
}
