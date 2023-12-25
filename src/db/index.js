import dotenv from 'dotenv';
dotenv.config({path:'./env'});

import mongoose from "mongoose";
import {DB_NAME} from "../constant.js";

const connectDB=async()=>{
try{
const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
console.log(`DB connected successfully: host is ${connectionInstance.connection.host}`) 
}catch(e){
console.log("DB connection failed:",e);
process.exit(1); 
}
}

export default connectDB;