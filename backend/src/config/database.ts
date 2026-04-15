import db from "../db/knex";

const connectDB = async (): Promise<void> => {
    try {
        await db.raw("SELECT 1");   // ye postgreSQL se connection test krta ha
        console.log("PostgreSQL Connected");
        await db.migrate.latest();  // App start honay pr automatically sb migrations chala deta ha (tables bna deta ha agr nai hain)
        console.log("Migrations ran successfully");
    } catch (err) {
        console.error("DB connection/migration error:", err);
        process.exit(1);
    }
};

export default connectDB;
