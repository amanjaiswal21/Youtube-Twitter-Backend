import dotenv from 'dotenv';
dotenv.config({
    path: "./.env"
});
 
import app from "./app.js" 
import connectDB from "./db/index.js"
 
const port=process.env.PORT ||8000;
connectDB()     // coonecttodb async method hai jab complete hota hai ye promise return // karta hai 
.then(()=>{  
    app.listen(8000,()=>{
        console.log(`Server is listening on : 8000`); 
    })
})
.catch((error)=>{
    console.log("MONGODB connection failed !!", error);
})