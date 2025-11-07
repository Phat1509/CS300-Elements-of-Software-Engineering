import { t } from "elysia";
import { jwt as jwtPlugin } from "@elysiajs/jwt";
import { sessionPlugin } from "./lib/sessions";

export const jwt = jwtPlugin({
    name: "jwt",
    secret: process.env.JWT_SECRET || crypto.randomUUID(),
    schema: t.Object({
        userID: t.Integer(),
    }),
});
export const sessions = sessionPlugin({
    schema: t.Object({
        userId: t.Optional(t.Integer()),
    }),
});
