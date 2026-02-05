import express from "express"
import { signUp } from "../Controllers/auth.controller.js"

const authRoute = express.Router()

authRoute.post("/signUp",signUp())


export default authRoute