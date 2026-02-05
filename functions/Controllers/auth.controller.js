
import { FIREBASEAPIKEY } from "../config/env.js";
import CustomeError from "../customeError.js";
import { asyncErrorHandler } from "../utility/asyncErrorHandler.js";
import * as logger from "firebase-functions/logger";

export const signUp = () => {
    return asyncErrorHandler(async (req, res, next) => {
         logger.info("signUp rout called");
      
        const { email, password } = req.body;

        if (!email || !password) {
            logger.console.warn("missing input");
           
            return next(new CustomeError("Email and password are required", 400));
        }


        const FIREBASE_API_KEY = FIREBASEAPIKEY;

        if (!FIREBASE_API_KEY) {
            logger.console.warn("firbase Api key required");
            return next(new CustomeError("Missing FIREBASE_API_KEY in .env", 500));
        }

        const firebaseRes = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    returnSecureToken: true,
                }),
            }
        );
        
        
        const data = await firebaseRes.json();
      

       

        if (!firebaseRes.ok) {
            logger.console.warn("Firbase error occerd");
            return next(
                
                new CustomeError(data?.error?.message || "Signup failed", 400)
            );
        }

        // data.idToken is REAL Firebase ID Token
        res.status(201).json({
            status: "success",
            message: "Signed up successfully",
            token: data.idToken,
            refreshToken: data.refreshToken,
            uid: data.localId,
            expiresIn: data.expiresIn,
        });
    });
};
