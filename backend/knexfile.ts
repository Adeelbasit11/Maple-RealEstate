import type { Knex } from "knex";
import dotenv from "dotenv";
dotenv.config();

const config: { [key: string]: Knex.Config } = {
    development: {
        client: "pg",
        connection: {
            host: process.env.PG_HOST || "localhost",
            port: parseInt(process.env.PG_PORT || "5432"),
            database: process.env.PG_DATABASE || "first_website",
            user: process.env.PG_USER || "postgres",
            password: process.env.PG_PASSWORD || "postgres",
        },
        migrations: {
            directory: "./src/db/migrations",
            extension: "ts",
        },
    },
};

export default config;
