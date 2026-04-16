import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("orders", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("customer_id").notNullable().references("id").inTable("auth_users");
        table.uuid("product_id").notNullable().references("id").inTable("products");
        table.string("order_number").unique().notNullable();
        table.timestamp("order_date").notNullable();
        table.string("order_code");
        table.string("status").notNullable(); // e.g., "Received", "Generated", "Transmitted", "Delivered"
        table.string("revenue_status").notNullable(); // e.g., "Paid", "Canceled", "Refunded"
        table.string("delivery_status");
        table.decimal("product_price", 12, 2).notNullable();
        table.decimal("delivery_cost", 12, 2).defaultTo(0);
        table.decimal("taxes", 12, 2).defaultTo(0);
        table.decimal("total_amount", 12, 2).notNullable();
        table.string("billing_name");
        table.string("billing_company");
        table.string("billing_email");
        table.string("vat_number");
        table.string("payment_type");
        table.string("card_number_last_digits");
        table.string("card_expiry");
        table.string("card_holder_name");
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("orders");
}

