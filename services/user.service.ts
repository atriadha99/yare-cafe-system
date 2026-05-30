import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export class UserService {
  static async getAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  static async getByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  static async create(
    name: string,
    email: string,
    password: string,
    role: "ADMIN" | "WAREHOUSE" | "CASHIER" | "MANAGER" = "CASHIER"
  ) {
    const hashedPassword = await hash(password, 10);

    return prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  static async update(
    id: string,
    data: { name?: string; role?: "ADMIN" | "WAREHOUSE" | "CASHIER" | "MANAGER" }
  ) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  static async delete(id: string) {
    return prisma.user.delete({
      where: { id },
      select: {
        id: true,
        email: true,
      },
    });
  }

  static async getUsersByRole(role: string) {
    return prisma.user.findMany({
      where: { role: role as any },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }
}
