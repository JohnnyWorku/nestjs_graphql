import dotenv from "dotenv"

dotenv.config({path:".env"})

const { NODE_ENV, FIREBASEAPIKEY } = process.env
console.log(NODE_ENV, FIREBASEAPIKEY)

export { NODE_ENV, FIREBASEAPIKEY }