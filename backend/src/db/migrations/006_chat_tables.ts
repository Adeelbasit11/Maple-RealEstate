import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    // Add chat-related columns to auth_users
    const hasAvatar = await knex.schema.hasColumn("auth_users", "avatar");
    if (!hasAvatar) {
        await knex.schema.alterTable("auth_users", (t) => {
            t.string("avatar").nullable().defaultTo("");
            t.boolean("is_online").defaultTo(false);
            t.timestamp("last_seen").defaultTo(knex.fn.now());
        });
    }

    // Chat Rooms
    await knex.schema.createTable("chat_rooms", (t) => {
        t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        t.string("name").unique().notNullable();
        t.string("description").defaultTo("");
        t.string("icon").defaultTo("💬");
        t.timestamps(true, true);
    });

    // Chat Room Members (junction table)
    await knex.schema.createTable("chat_room_members", (t) => {
        t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        t.uuid("room_id").references("id").inTable("chat_rooms").onDelete("CASCADE").notNullable();
        t.uuid("user_id").references("id").inTable("auth_users").onDelete("CASCADE").notNullable();
        t.timestamps(true, true);
        t.unique(["room_id", "user_id"]);
    });

    // Chat Messages
    await knex.schema.createTable("chat_messages", (t) => {
        t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        t.uuid("room_id").references("id").inTable("chat_rooms").onDelete("CASCADE").notNullable();
        t.uuid("sender_id").references("id").inTable("auth_users").onDelete("SET NULL").nullable();
        t.string("sender_name").notNullable();
        t.string("sender_avatar").defaultTo("");
        t.text("content").notNullable();
        t.string("type").defaultTo("text"); // "text" or "system"
        t.boolean("is_edited").defaultTo(false);
        t.timestamp("timestamp").defaultTo(knex.fn.now());
        t.timestamps(true, true);
    });

    // Read Messages
    await knex.schema.createTable("chat_read_messages", (t) => {
        t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        t.uuid("message_id").references("id").inTable("chat_messages").onDelete("CASCADE").notNullable();
        t.uuid("user_id").references("id").inTable("auth_users").onDelete("CASCADE").notNullable();
        t.timestamp("read_at").defaultTo(knex.fn.now());
        t.timestamps(true, true);
        t.unique(["message_id", "user_id"]);
    });

    // Friend Requests
    await knex.schema.createTable("chat_friend_requests", (t) => {
        t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        t.uuid("sender_id").references("id").inTable("auth_users").onDelete("CASCADE").notNullable();
        t.uuid("receiver_id").references("id").inTable("auth_users").onDelete("CASCADE").notNullable();
        t.string("status").defaultTo("pending"); // "pending", "accepted", "rejected"
        t.timestamps(true, true);
        t.unique(["sender_id", "receiver_id"]);
    });

    // Direct Chats
    await knex.schema.createTable("chat_direct_chats", (t) => {
        t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        t.uuid("user1_id").references("id").inTable("auth_users").onDelete("CASCADE").notNullable();
        t.uuid("user2_id").references("id").inTable("auth_users").onDelete("CASCADE").notNullable();
        t.timestamps(true, true);
        t.unique(["user1_id", "user2_id"]);
    });

    // Direct Messages
    await knex.schema.createTable("chat_direct_messages", (t) => {
        t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        t.uuid("chat_id").references("id").inTable("chat_direct_chats").onDelete("CASCADE").notNullable();
        t.uuid("sender_id").references("id").inTable("auth_users").onDelete("SET NULL").nullable();
        t.string("sender_name").notNullable();
        t.string("sender_avatar").defaultTo("");
        t.text("content").notNullable();
        t.timestamp("timestamp").defaultTo(knex.fn.now());
        t.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("chat_direct_messages");
    await knex.schema.dropTableIfExists("chat_direct_chats");
    await knex.schema.dropTableIfExists("chat_friend_requests");
    await knex.schema.dropTableIfExists("chat_read_messages");
    await knex.schema.dropTableIfExists("chat_messages");
    await knex.schema.dropTableIfExists("chat_room_members");
    await knex.schema.dropTableIfExists("chat_rooms");

    const hasAvatar = await knex.schema.hasColumn("auth_users", "avatar");
    if (hasAvatar) {
        await knex.schema.alterTable("auth_users", (t) => {
            t.dropColumn("avatar");
            t.dropColumn("is_online");
            t.dropColumn("last_seen");
        });
    }
}
