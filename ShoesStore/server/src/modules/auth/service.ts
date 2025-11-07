import { status } from "elysia";
import { db } from "@/db";
import { UnsuccessfulAPIResponse } from "@/types/api";
import {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
} from "./model";

export async function LoginWithUsernamePassword(
    data: LoginRequest,
): Promise<LoginResponse> {
    const user = await db
        .selectFrom("users")
        .selectAll()
        .where("username", "=", data.username)
        .executeTakeFirst();

    if (!user) {
        throw status(404, {
            error: "This user does not exist.",
        } satisfies UnsuccessfulAPIResponse);
    }

    if (!user.password) {
        throw status(401, {
            error: "This user does not have a password. Cannot login using username/password.",
        } satisfies UnsuccessfulAPIResponse);
    }

    if (!Bun.password.verify(data["!password"], user.password)) {
        throw status(401, {
            error: "Invalid password.",
        } satisfies UnsuccessfulAPIResponse);
    }

    return {
        userId: user.user_id,
    };
}

export async function Register(
    data: RegisterRequest,
): Promise<RegisterResponse> {
    const existingUser = await db
        .selectFrom("users")
        .selectAll()
        .where("username", "=", data.username)
        .executeTakeFirst();

    if (existingUser) {
        throw status(409, {
            error: "User with this username already exists.",
        } satisfies UnsuccessfulAPIResponse);
    }

    const hashedPassword = await Bun.password.hash(data["!password"]);

    await db
        .insertInto("users")
        .values({
            username: data.username,
            password: hashedPassword,
            fullname: data.fullname,
            email: data.email,
        })
        .execute();

    return {
        message: "User registered successfully.",
    };
}
