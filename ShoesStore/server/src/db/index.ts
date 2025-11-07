import { Kysely } from "kysely";
import { DB } from "./types";
import { BunPostgresDialect } from "kysely-bun-sql";

export const db = new Kysely<DB>({
    dialect: new BunPostgresDialect({
        url: process.env.DATABASE_URL,
        clientOptions: {
            bigint: true,
        },
    }),
});
