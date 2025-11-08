import { t } from "elysia";
import { jwt as jwtPlugin } from "@elysiajs/jwt";
import { session } from "@beerpsi/elysia-session";
import { BunSQLStore } from "@beerpsi/elysia-session/store/bun";

export const jwt = jwtPlugin({
    name: "jwt",
    secret: process.env.JWT_SECRET || crypto.randomUUID(),
    schema: t.Object({
        userID: t.Integer(),
    }),
});
export const sessions = session({
    store: new BunSQLStore({
        sql: {
            adapter: "postgres",
            url: process.env.DATABASE_URL,
        },
    }),
    schema: t.Object({
        userId: t.Integer(),
    }),
});
