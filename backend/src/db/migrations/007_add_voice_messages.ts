import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    const hasAudioUrl = await knex.schema.hasColumn("chat_messages", "audio_url");
    if (!hasAudioUrl) {
        await knex.schema.alterTable("chat_messages", (t) => {
            t.text("audio_url").nullable();
            t.float("audio_duration").nullable();
        });
    }
}

export async function down(knex: Knex): Promise<void> {
    const hasAudioUrl = await knex.schema.hasColumn("chat_messages", "audio_url");
    if (hasAudioUrl) {
        await knex.schema.alterTable("chat_messages", (t) => {
            t.dropColumn("audio_url");
            t.dropColumn("audio_duration");
        });
    }
}
