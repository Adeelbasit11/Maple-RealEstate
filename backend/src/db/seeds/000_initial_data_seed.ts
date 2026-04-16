import type { Knex } from "knex";
import bcrypt from "bcryptjs";

// Simple UUID generator to bypass module import issues
function generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("products").del();
    await knex("auth_users").del();

    // Insert dummy users
    const hashedPassword = await bcrypt.hash("password", 10);
    const davidId = generateUuid();
    const warnerId = generateUuid();

    const users = [
        {
            id: davidId,
            name: "David",
            email: "david@example.com",
            password: hashedPassword,
            role: "Admin",
            is_verified: true,
            created_at: new Date(),
            updated_at: new Date(),
        },
        {
            id: warnerId,
            name: "Warner",
            email: "warner@example.com",
            password: hashedPassword,
            role: "Viewer",
            is_verified: true,
            created_at: new Date(),
            updated_at: new Date(),
        },
    ];
    await knex("auth_users").insert(users);

    // Insert dummy products
    const products = [
        {
            id: generateUuid(),
            name: "BKLGO Hoodie",
            description: "Comfortable and stylish hoodie.",
            price: 50.00,
            currency: "USD",
            quantity: 100,
            status: "In Stock",
            owner_id: davidId,
            created_at: new Date(),
            updated_at: new Date(),
        },
        {
            id: generateUuid(),
            name: "MacBook Pro",
            description: "High performance laptop.",
            price: 1500.00,
            currency: "USD",
            quantity: 50,
            status: "In Stock",
            owner_id: warnerId,
            created_at: new Date(),
            updated_at: new Date(),
        },
    ];
    await knex("products").insert(products);
};
