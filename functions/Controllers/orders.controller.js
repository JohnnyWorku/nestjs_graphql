import CustomeError from "../customeError.js"
import { asyncErrorHandler } from "../utility/asyncErrorHandler.js"
import admin from "firebase-admin"
import * as logger from "firebase-functions/logger";


export const createOrder = (db)=>{
     return asyncErrorHandler( async (req, res,next) => { 
      
        logger.info("Create order rout called");
        const { id, userId, items, } = req.body

         let total = 0;

         if(!id || !userId || !items){
            logger.warn("Signup failed: missing input");
            const err = new CustomeError(`missing input`, 400)
            throw(err)

         }

        for (const item of items){
           total += item.qty * item.unitPrice

           const productdocRef = db.collection("products").doc(item.productId);
           const productSnap = await productdocRef.get();

           

           if (productSnap.data().stock < item.qty){
              logger.warn("Runned out of stock");
              const err = new CustomeError(`Product named:${productSnap.data().name}  is out of stock `, 400)
              throw (err)
              return;
           }
        }

        await db.collection("orders").doc(id).create({
           userId,
           items,
           status: "PENDING",
           total,           
           createdAt: admin.firestore.FieldValue.serverTimestamp(),
           updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });


        res.status(201).json({
           status: "success",
           message: "order seted to pending created successfully"
        });   
    
        })

}
export const confirmOrder = (db)=>{
    return asyncErrorHandler( async (req, res,next) => { 
       logger.info("confirm order rout called");

       const {id}  = req.params       
       const orderDocRef = db.collection("orders").doc(id);
       const orderDocSnap = await orderDocRef.get();

       if (!orderDocSnap.exists) {
          logger.warn("Order doesn't exist");
          const err = new CustomeError("Such order doesn't exist", 400);
          throw(err);
         }
         
       if (orderDocSnap.data().status === "CONFIRMED"){
          logger.warn("Order is already confirmed");
          const err = new CustomeError("The order is already confirmed", 400);
          throw(err);
       }


       for (const item of orderDocSnap.data().items) {
         
         console.log(item)
          const productdocRef = db.collection("products").doc(item.productId);
          const productSnap = await productdocRef.get();

         console.log(item.productId)
          console.log(productSnap.data().stock, item.qty)
          if (productSnap.data().stock < item.qty) {
             const err = new CustomeError(`Product named:${productSnap.data().name}  is out of stock `, 400)
             throw (err)
             return;
          }
       }

      for (const item of orderDocSnap.data().items) {


          const productdocRef = db.collection("products").doc(item.productId);
          const productSnap = await productdocRef.get();

          if (productSnap.data().stock < item.qty) {
             const err = new CustomeError(`Product named:${productSnap.data().name}  is out of stock `, 400)
             throw (err)
             return;
          }

          await productdocRef.update({
             stock : productSnap.data().stock - item.qty,
             updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          })

       }

       await orderDocRef.update({         
          status: "CONFIRMED",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
       });


       res.status(201).json({
          status: "success",
          message: "Order Confirmed"
       });

    })
   
   
   
       

}
export const cancelOrder = (db)=>{
    return asyncErrorHandler( async (req, res,next) => { 
       logger.info("cancel order rout called");

       const { id } = req.params
       const orderDocRef = db.collection("orders").doc(id);
       const orderDocSnap = await orderDocRef.get();

       if (!orderDocSnap.exists) {
          logger.warn("order Doesn't exist");
          const err = new CustomeError("Such order doesn't exist", 400);
          throw (err);
       }

       if (orderDocSnap.data().status === "CONFIRMED") {
          logger.warn("order is already confirmed");
          const err = new CustomeError("The order is already confirmed", 400);
          throw (err);
       }
       if (orderDocSnap.data().status === "CANCELED") {
          logger.warn("order is already canceled");
          const err = new CustomeError("The order is already Canceled", 400);
          throw (err);
       }
     

       await orderDocRef.update({
          status: "CANCELED",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
       });


       res.status(201).json({
          status: "success",
          message: "Order canceled"
       });  
   
       })

}