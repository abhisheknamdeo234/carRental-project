import express from "express";
import "dotenv/config"
import cors from "cors"

import connectDb from "./configs/db.js"; 
import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";

// initiallize express app

const app = express();

// database
// middleware

app.use(cors());
app.use(express.json());




const PORT = process.env.PORT || 3000;

connectDb();

app.get("/",(req,res)=>{
    res.send("send successfully")
})
app.use('/api/user',userRouter)
app.use('/api/owner',ownerRouter)
app.use('/api/bookings',bookingRouter)

app.listen(PORT,()=>{
    console.log(`Sever Runnging on port ${PORT}`)
})

