import CustomeError from "../customeError.js";
import { asyncErrorHandler } from "../utility/asyncErrorHandler.js"
import admin from "firebase-admin"
import * as logger from "firebase-functions/logger";





export const createProduct =  (db) => {
    return asyncErrorHandler( async(req, res,next) => {
    logger.info("Create products rout called"); 
     const {id,name,sku,price,stock} = req.body

     await db.collection("products").doc(id).create({
                name,
                sku,
                stock,
                price,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
     
    
     res.status(201).json({
        status:"success",
        message:"Product created successfully"
     })



    })

}
export const adjustStock =  (db) => {
    return asyncErrorHandler(async (req, res,next) => {
            logger.info("adjust products rout called");

            const { id } = req.params;
            const { stockChangeBy } = req.body

        

            const docRef = db.collection("products").doc(id);
            const docSnap = await docRef.get();
            

            if (!docSnap.exists) {
                 logger.warn("product doesnt exist");
                const err = new CustomeError( "Product doesn't exist",400)
                err.statusCode = 400
                throw (err)
                return;
            }

            if(docSnap.data().stock + stockChangeBy < 0){
                logger.warn("product out of stock");
                const err = new CustomeError( "stock can't be negative",400)
                err.statusCode = 400
                throw(err)
                return;

            }

            const doc = await docRef.update({
                stock: docSnap.data().stock + stockChangeBy,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            })

            return res.status(200).json({
                status:"success",
                id: docSnap.id,      // unique Firestore document ID
                message:`stock with product id ${docSnap.id} updated successfully`,
                   // product data
            });
       


    })
}
