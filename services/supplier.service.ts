import { prisma } from "@/lib/prisma";
import { CreateSupplierInput } from "@/lib/validation";

export class SupplierService {
  static async getAll() {
    return prisma.supplier.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string) {
    return prisma.supplier.findUnique({
      where: { id },
    });
  }

  static async create(data: CreateSupplierInput) {
    return prisma.supplier.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      },
    });
  }

  static async update(id: string, data: Partial<CreateSupplierInput>) {
    return prisma.supplier.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.supplier.delete({
      where: { id },
    });
  }
}
