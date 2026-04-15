import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("team_members", (t) => {
        t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        t.string("name").notNullable();
        t.string("email").unique().notNullable();
        t.string("phone");
        t.string("username");
        t.string("city");
        t.string("country");
        t.string("zip_code");
        t.text("bio");
        t.string("timezone");
        t.string("profile_image");
        t.string("role").defaultTo("Viewer");
        t.boolean("is_verified").defaultTo(true);
        t.boolean("is_deleted").defaultTo(false);
        t.timestamp("deleted_at");
        t.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("team_members");
}
