import dotenv from 'dotenv';
dotenv.config();
 
import app from "./app.js" 
import connectDB from "./db/index.js"
 
const port=process.env.PORT ||8000;
connectDB()    
.then(()=>{
    app.listen(8000,()=>{
        console.log(`Server is listening on : ${port}`);
    })
})
.catch((error)=>{
    console.log("MONGODB connection failed !!", error);
})