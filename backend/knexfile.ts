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
            user: process.env.PG_USER,
            password: process.env.PG_PASSWORD,
        },
        migrations: {
            directory: "./src/db/migrations",
            extension: "ts",
        },
        seeds: {
            directory: "./src/db/seeds",
            extension: "ts",
        },
    },
};

export default config;
