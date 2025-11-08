import { Elysia } from "elysia";
import authModule from "@/modules/auth";
import { sessions } from "./plugins";

const app = new Elysia({ prefix: "/api/v1" })
    .use(sessions)
    .use(authModule)
    .listen({ hostname: "0.0.0.0", port: 3000 });

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
