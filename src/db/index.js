import dotenv from 'dotenv';
dotenv.config({path:'./env'});

import mongoose from "mongoose";
import {DB_NAME} from "../constant.js";

const connectDB=async()=>{
try{
const connectionInstance= await mongoose.connect("mongodb://127.0.0.1:27017/backenddatabase");
console.log(`DB connected successfully: host is ${connectionInstance.host}`) 
}catch(e){
console.log("DB connection failed:",e);
process.exit(1); 
}
}

export default connectDB;