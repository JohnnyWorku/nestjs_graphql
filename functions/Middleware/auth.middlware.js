import admin from "firebase-admin";
import CustomeError from "../customeError.js";
import * as logger from "firebase-functions/logger";

export const requireAuth = async (req, res, next) => {
    logger.info("auth middlware called"); 
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            logger.info("token missing"); 
            const err = new CustomeError("Authorization token missing",401);
            return
        }

        const token = authHeader.split(" ")[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        req.user = decodedToken;

        next();
    } catch (err) {        
        next(err)
      
    }
};
