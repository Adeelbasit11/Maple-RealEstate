import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("orders").del();

    // Fetch existing user and product IDs
    const david = await knex("auth_users").where({ email: "david@example.com" }).first();
    const warner = await knex("auth_users").where({ email: "warner@example.com" }).first();
    const bklgoHoodie = await knex("products").where({ name: "BKLGO Hoodie" }).first();
    const macbookPro = await knex("products").where({ name: "MacBook Pro" }).first();

    if (!david || !warner || !bklgoHoodie || !macbookPro) {
        console.error("Missing initial user or product data. Please run 000_initial_data_seed.ts first.");
        return;
    }

    // Inserts seed entries
    await knex("orders").insert([
        {
            id: "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55",
            customer_id: david.id,
            product_id: bklgoHoodie.id,
            order_number: "#10421",
            order_date: new Date("2023-01-12"),
            order_code: "EL001",
            status: "Delivered",
            revenue_status: "Paid",
            delivery_status: "Order was delivered 2 days ago",
            product_price: 200.00,
            delivery_cost: 10.00,
            taxes: 20.00,
            total_amount: 230.00,
            billing_name: "Oliver Liam",
            billing_company: "Viking Burrito",
            billing_email: "Oliver.viking@burrito.com",
            vat_number: "FRB1235476",
            payment_type: "Master Card",
            card_number_last_digits: "58745",
            card_expiry: "12/23",
            card_holder_name: "Aiden Max",
        },
        {
            id: "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66",
            customer_id: warner.id,
            product_id: macbookPro.id,
            order_number: "#10422",
            order_date: new Date("2023-01-13"),
            order_code: "EL002",
            status: "Transmitted",
            revenue_status: "Canceled",
            delivery_status: "Pending delivery",
            product_price: 1200.00,
            delivery_cost: 15.00,
            taxes: 120.00,
            total_amount: 1335.00,
            billing_name: "Warner Smith",
            billing_company: "Tech Solutions",
            billing_email: "warner.smith@example.com",
            vat_number: "GB123456789",
            payment_type: "Visa",
            card_number_last_digits: "12345",
            card_expiry: "10/25",
            card_holder_name: "Warner Smith",
        },
        {
            id: "11eebc99-9c0b-4ef8-bb6d-6bb9bd380a77",
            customer_id: david.id,
            product_id: macbookPro.id,
            order_number: "#10423",
            order_date: new Date("2023-01-14"),
            order_code: "EL003",
            status: "Generated",
            revenue_status: "Refunded",
            delivery_status: "Refund processed",
            product_price: 50.00,
            delivery_cost: 5.00,
            taxes: 5.00,
            total_amount: 60.00,
            billing_name: "David Johnson",
            billing_company: "Retail Inc.",
            billing_email: "david.j@example.com",
            vat_number: "DE987654321",
            payment_type: "PayPal",
            card_number_last_digits: "N/A",
            card_expiry: "N/A",
            card_holder_name: "David Johnson",
        },
    ]);
};