import fs from "fs"
import path from "path"
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors"


import * as functions from "firebase-functions";
import admin from "firebase-admin"
import orderRoute from "./Routes/orders.route.js";
import productRoute from "./Routes/products.route.js";
import { globalErrorHandler } from "./Controllers/error.controller.js";
import authRoute from "./Routes/auth.route.js";


// import logger from "firebase-functions/logger";


const app = express()
app.use(express.json());
app.use(cors({ origin: true }))




const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccount = JSON.parse(
    fs.readFileSync(path.join(__dirname, "permisions.json"), "utf8")
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore()




app.use("/api/v1/products", productRoute(db))
app.use("/api/v1/orders", orderRoute(db))
app.use("/api/v1/auth", authRoute)



app.use(globalErrorHandler)






export default app
export const api = functions.https.onRequest(app)





