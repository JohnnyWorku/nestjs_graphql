import express from "express"
import { adjustStock, createProduct } from "../Controllers/products.controller.js"
import { bodyValidator } from "../Middleware/bodyValidator.js"
import { productSchema, productStockSchema } from "../Models/product.model.js"
import { requireAuth } from "../Middleware/auth.middlware.js"


const productRoute =(db)=>{
    const router = express.Router()
    router.post("/",requireAuth ,bodyValidator(productSchema) ,createProduct(db))
    router.post("/:id/stock",requireAuth,bodyValidator(productStockSchema) ,adjustStock(db))

    return router

} 

   



export default productRoute