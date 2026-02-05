import * as logger from "firebase-functions/logger";

export const asyncErrorHandler = (func)=>{

    return ((req,res,next)=>{
        func(req, res, next).catch(err =>{ 
            logger.error("errore occered",err)            
            next(err)})
    })
     

}


