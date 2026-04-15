import dotenv from "dotenv";
dotenv.config();

import db from "./db/knex";

const updateToSuperAdmin = async (): Promise<void> => {
    try {
        await db.raw("SELECT 1");
        console.log("Connected to PostgreSQL");

        const email = "adeelbasit33@gmail.com";
        const count = await db("auth_users")
            .where({ email })
            .update({ role: "SuperAdmin", updated_at: new Date() });

        if (count) {
            console.log(`Successfully updated ${email} to SuperAdmin`);
        } else {
            console.log(`User ${email} not found`);
        }

        await db.destroy();
        process.exit(0);
    } catch (error) {
        console.error("Error updating user:", error);
        process.exit(1);
    }
};

updateToSuperAdmin();
