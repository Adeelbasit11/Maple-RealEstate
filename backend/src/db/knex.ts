import Knex from "knex";

function toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

function processRow(row: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const key of Object.keys(row)) {
        const camelKey = toCamelCase(key);
        result[camelKey] = row[key];
    }
    if (result.id !== undefined) {
        result._id = result.id;
    }
    return result;
}

const db = Knex({
    client: "pg",
    connection: {
        host: process.env.PG_HOST || "localhost",
        port: parseInt(process.env.PG_PORT || "5432"),
        database: process.env.PG_DATABASE || "first_website",
        user: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
    },
    pool: { min: 2, max: 10 },
    migrations: {
        directory: __dirname + "/migrations",
        extension: "ts",
        loadExtensions: [".ts"],
    },
    postProcessResponse: (result: any) => {
        if (Array.isArray(result)) {
            return result.map(processRow);
        }
        if (result && typeof result === "object") {
            return processRow(result);
        }
        return result;
    },
});

export default db;
