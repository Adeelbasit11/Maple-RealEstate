import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("invitations", (t) => {
        t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        t.string("email").notNullable();
        t.string("token").unique().notNullable();
        t.uuid("owner_id").notNullable().references("id").inTable("auth_users");
        t.boolean("is_used").defaultTo(false);
        t.boolean("is_accessed").defaultTo(false);
        t.timestamp("expires_at").notNullable();
        t.string("role").defaultTo("Viewer");
        t.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("invitations");
}
