import express from "express"
import { cancelOrder, confirmOrder, createOrder } from "../Controllers/orders.controller.js"
import { bodyValidator } from "../Middleware/bodyValidator.js"
import { orderSchema } from "../Models/order.model.js"
import { requireAuth } from "../Middleware/auth.middlware.js"

const orderRoute = (db)=>{
    const router = express.Router()

    router.post("/",requireAuth,bodyValidator(orderSchema) ,createOrder(db))
    router.post("/:id/confirm", requireAuth, confirmOrder(db))
    router.post("/:id/cancel", requireAuth,cancelOrder(db))

    return router


}




export default orderRoute