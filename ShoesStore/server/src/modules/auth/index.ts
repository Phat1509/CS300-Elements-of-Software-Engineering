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

export default new Elysia({ prefix: "/auth" })
  .use(sessions)
  .post(
    "/login",
    async ({ session, body }) => {
      const response = await LoginWithUsernamePassword(body);

      session.set("userId", response.userId);

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
    }
  )
  .get(
    "/me",
    async ({ session }) => {
      const userId = session.get("userId");
      if (!userId) return status(401, { error: "Not authenticated" });
      return { userId };
    },
    {
      response: {
        200: t.Any,
        401: UnsuccessfulAPIResponse,
      },
    }
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
    async ({ session }) => {
      const userId = session.get("userId");

      if (!userId) {
        throw status(401, {
          error: "You are not logged in.",
        } satisfies UnsuccessfulAPIResponse);
      }

      session.clear();

      return {
        message: "Logout successful.",
      };
    },
    {
      response: {
        200: LogoutResponse,
        401: UnsuccessfulAPIResponse,
      },
    }
  );
