export const bodyValidator =(schema)=>{
    return (req,res,next)=>{
                    try{
                        req.body = schema.parse(req.body)
                        next()

                    }catch(err){
                        next(err)
                    }
                }
}