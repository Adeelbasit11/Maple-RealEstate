import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    const hasColumn = await knex.schema.hasColumn("auth_users", "last_name");
    if (!hasColumn) {
        await knex.schema.alterTable("auth_users", (table) => {
            table.string("last_name").nullable();
        });
    }
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable("auth_users", (table) => {
        table.dropColumn("last_name");
    });
}
