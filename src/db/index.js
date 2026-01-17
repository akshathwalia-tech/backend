import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        // Log this to see if the URI is actually coming through
        console.log("Connecting to:", process.env.MONGODB_URI); 

        const connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_URI}/${DB_NAME}`
        );

        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        // Use console.error and don't reference connectionInstance here
        console.error("MONGODB connection FAILED: ", error.message);
        process.exit(1);
    }
};

export default connectDB;