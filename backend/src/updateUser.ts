import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import AuthUser from "./models/AuthUser";

const updateToSuperAdmin = async (): Promise<void> => {
    try {
        console.log("Using URI:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log("Connected to DB:", mongoose.connection.db?.databaseName);

        const email = "adeelbasit33@gmail.com";
        const user = await AuthUser.findOneAndUpdate(
            { email },
            { role: "SuperAdmin" },
            { returnDocument: "after" }
        );

        if (user) {
            console.log(`Successfully updated ${email} to SuperAdmin`);
        } else {
            console.log(`User ${email} not found`);
        }

        process.exit(0);
    } catch (error) {
        console.error("Error updating user:", error);
        process.exit(1);
    }
};

updateToSuperAdmin();
