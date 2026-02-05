import { NODE_ENV } from "../config/env.js";

export const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";


    if (NODE_ENV == "development") {
        res.status(err.statusCode).json({
            status: err.statusCode,
            message: err.message,
            stackTrace: err.stack,
            error: err
        })

    } else {

        if (err.isOperational == true) {
            res.status(err.statusCode).json({
                status: err.statusCode,
                message: err.message,
            })

        }
        else {
            res.status(500).json({
                status: "error",
                message: "Something went wrong! Please try again later",
            })

        }


    }


}