import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Menu schemas
export const createMenuSchema = z.object({
  name: z.string().min(1, "Menu name is required"),
  price: z.number().min(0, "Price must be positive"),
  stock: z.number().int().min(0, "Stock must be positive").optional(),
  image: z.string().optional(),
});

export const updateMenuSchema = createMenuSchema.partial();

// Raw Material schemas
export const createRawMaterialSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Name is required"),
  unit: z.string().min(1, "Unit is required"),
  unitCost: z.number().min(0, "Unit cost must be positive"),
  minStock: z.number().int().min(0, "Min stock must be positive").optional(),
});

export const updateRawMaterialSchema = createRawMaterialSchema.partial();

// Inventory Transaction schemas
export const createInventoryTransactionSchema = z.object({
  rawMaterialId: z.string().min(1, "Raw material is required"),
  type: z.enum(["in", "out", "adjustment"], { errorMap: () => ({ message: "Invalid type" }) }),
  quantity: z.number().int().min(1, "Quantity must be positive"),
  reason: z.string().optional(),
  referenceId: z.string().optional(),
  referenceType: z.enum(["purchase_order", "stock_opname", "manual"]).optional(),
});

// Purchase Order schemas
export const createPurchaseOrderSchema = z.object({
  poNumber: z.string().min(1, "PO number is required"),
  items: z.array(
    z.object({
      rawMaterialId: z.string(),
      quantityRequested: z.number().int().min(1),
      unitPrice: z.number().min(0),
    })
  ),
  notes: z.string().optional(),
});

export const approvePurchaseOrderSchema = z.object({
  totalAmount: z.number().min(0, "Total amount must be positive").optional(),
});

export const receivePurchaseOrderSchema = z.object({
  items: z.array(
    z.object({
      purchaseOrderItemId: z.string(),
      quantityReceived: z.number().int().min(0),
    })
  ),
});

// Stock Opname schemas
export const createStockOpnameSchema = z.object({
  items: z.array(
    z.object({
      rawMaterialId: z.string(),
      systemStock: z.number().int().min(0),
      actualStock: z.number().int().min(0),
      notes: z.string().optional(),
    })
  ),
  notes: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateMenuInput = z.infer<typeof createMenuSchema>;
export type CreateRawMaterialInput = z.infer<typeof createRawMaterialSchema>;
export type CreateInventoryTransactionInput = z.infer<typeof createInventoryTransactionSchema>;
export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>;
export type CreateStockOpnameInput = z.infer<typeof createStockOpnameSchema>;
