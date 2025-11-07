import Elysia, { status, t } from "elysia";
import { UnsuccessfulAPIResponse } from "@/types/api";
import {
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    RegisterRequest,
    RegisterResponse,
} from "./model";
import { LoginWithUsernamePassword, Register } from "./service";
import { sessions } from "@/plugins";
import { db } from "@/db";

export default new Elysia({ prefix: "/auth" })
    .use(sessions)
    .post(
        "/login",
        async ({ session, body }) => {
            const response = await LoginWithUsernamePassword(body);

            session.userId = response.userId;

            return response;
        },
        {
            body: LoginRequest,
            response: {
                200: LoginResponse,
                403: UnsuccessfulAPIResponse,
                404: UnsuccessfulAPIResponse,
                500: UnsuccessfulAPIResponse,
            },
        },
    )
    .post("/register", async ({ body }) => Register(body), {
        body: RegisterRequest,
        response: {
            200: RegisterResponse,
            409: UnsuccessfulAPIResponse,
            500: UnsuccessfulAPIResponse,
        },
    })
    .post(
        "/logout",
        async ({ session, cookie }) => {
            if (!session.userId) {
                throw status(401, {
                    error: "You are not logged in.",
                } satisfies UnsuccessfulAPIResponse);
            }

            const sessionId = cookie.session.value;

            if (sessionId) {
                await db
                    .deleteFrom("sessions")
                    .where("id", "=", sessionId)
                    .execute();
            }

            cookie.session.remove();

            return {
                message: "Logout successful.",
            };
        },
        {
            response: {
                200: LogoutResponse,
                401: UnsuccessfulAPIResponse,
            },
        },
    );
