import { z } from "zod";
export const productSchema = z.object({
    id: z.string().min(1, "Product ID is required"),
    name: z.string().min(1, "Product name is required"),
    sku: z.string().min(1, "SKU is required"),
    price: z.number().positive("Price must be greater than 0"),
    stock: z.number().int().nonnegative("Stock must be 0 or greater"),
    updatedAt: z
        .union([z.string(), z.instanceof(Date)])
        .optional(), // can be string timestamp or Date object
});

export const productStockSchema = z.object({    
    stockChangeBy: z.number().int()
    
});
