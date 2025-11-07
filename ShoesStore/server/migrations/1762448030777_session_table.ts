import type { Kysely } from "kysely";

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable("sessions")
        .addColumn("id", "varchar(64)", (col) => col.primaryKey())
        .addColumn("expires_at", "timestamptz")
        .addColumn("data", "jsonb")
        .execute();
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable("sessions").execute();
}
