import mongoose from "mongoose";


const connectDB=async()=>{
    try{
        const mongoUri = process.env.MONGO_URI;
        const dbName = process.env.DB_NAME;

        if (!mongoUri || !dbName) {
            throw new Error("Missing MONGO_URI or DB_NAME in backend/src/.env");
        }

        await mongoose.connect(`${mongoUri.replace(/\/$/, "")}/${dbName}`);
        console.log("Connected to MongoDB");
    }
    catch(error){
        console.log("ERROR",error)
        throw error
    }
    }
    export default connectDB;


