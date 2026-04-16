import knex from "./src/db/knex";
import dotenv from "dotenv";
dotenv.config();

async function checkTable() {
    console.log("PG_USER:", process.env.PG_USER);
    console.log("PG_PASSWORD:", process.env.PG_PASSWORD);
    try {
        const tables = await knex.raw("SELECT tablename FROM pg_tables WHERE schemaname = 'public';");
        console.log("Tables in database:", tables.rows.map((row: any) => row.tablename));
        const exists = await knex.schema.hasTable("orders");
        if (exists) {
            console.log("Table 'orders' exists.");
        } else {
            console.log("Table 'orders' does NOT exist.");
        }
    } catch (error) {
        console.error("Error checking table existence:", error);
    } finally {
        knex.destroy();
    }
}

checkTable();