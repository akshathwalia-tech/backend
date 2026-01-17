import dotenv from "dotenv"
import connectDB from "./db/index.js";


dotenv.config({
    path: './.env'
})



connectDB()










/*
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import express from "express";

const app = express();

;( async () => {
    try {
        // Connect to MongoDB using variables from .env and constants
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        
        // Listener to check if Express app can communicate with the DB
        app.on("error", (error) => {
            console.log("ERRR: ", error);
            throw error;
        });

        // Start listening on the designated port
        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        });

    } catch (error) {
        // Standard error handling for connection failure
        console.error("ERROR: ", error);
        throw error;
    }
})()
the above code is about connecting the whole database in index.js only which is not preffered
*/