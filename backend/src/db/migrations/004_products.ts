import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("products", (t) => {
        t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        t.string("name").notNullable();
        t.string("weight");
        t.string("size");
        t.string("category");
        t.text("description");
        t.string("image");
        t.string("facebook_account");
        t.string("instagram_account");
        t.string("linkedin_account");
        t.string("dribbble_account");
        t.string("behance_account");
        t.string("ui8_account");
        t.decimal("price", 12, 2).defaultTo(0);
        t.string("currency").defaultTo("USD");
        t.string("sku");
        t.string("tags");
        t.integer("quantity").defaultTo(0);
        t.string("status").defaultTo("In Stock");
        t.uuid("owner_id").notNullable().references("id").inTable("auth_users");
        t.boolean("is_deleted").defaultTo(false);
        t.timestamp("deleted_at");
        t.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("products");
}
