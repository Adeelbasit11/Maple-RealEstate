import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    await knex.schema.createTable("auth_users", (t) => {
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
        t.string("password").notNullable();
        t.string("role").defaultTo("Viewer");
        t.boolean("is_verified").defaultTo(false);
        t.string("reset_password_token");
        t.timestamp("reset_password_expire");
        t.uuid("owner_id").references("id").inTable("auth_users").nullable();
        t.string("stripe_customer_id");
        t.string("subscription_id");
        t.string("subscription_plan").defaultTo("Free");
        t.string("subscription_status").defaultTo("unpaid");
        t.timestamp("subscription_current_period_end");
        t.boolean("is_deleted").defaultTo(false);
        t.timestamp("deleted_at");
        t.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("auth_users");
}
