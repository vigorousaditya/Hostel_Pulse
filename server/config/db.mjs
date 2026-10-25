import mongoose from "mongoose";
export const connectDB=async()=>{
    try{
          const dbURL=process.env.MONGO_URI
    if(!dbURL){
        throw new Error("MongoURL is not defined in .env");
    }

    await mongoose.connect(dbURL)
    console.log("MongoDB connected sucessfully")
    }
    
    catch(error){
        console.error("MongoDB connection failed!",error.message);
    }
  

}



