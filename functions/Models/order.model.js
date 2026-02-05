import { z } from "zod";


const orderItemSchema = z.object({
    productId: z.string().min(1, "Product ID is required"),
    qty: z.number().int().positive("Quantity must be greater than 0"),
    unitPrice: z.number().positive("Unit price must be greater than 0"),
});

export const orderSchema = z.object({
    id: z.string().min(1, "Order ID is required"),
    userId: z.string().min(1, "User ID is required"),
    items: z.array(orderItemSchema).min(1, "At least one item is required"),    createdAt: z
        .union([z.string(), z.instanceof(Date)])
        .optional(), // string timestamp or Date object
    updatedAt: z
        .union([z.string(), z.instanceof(Date)])
        .optional(),
});
