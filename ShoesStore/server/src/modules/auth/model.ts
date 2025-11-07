import { t } from "elysia";

export const LoginRequest = t.Object({
    username: t.String(),
    "!password": t.String(),
});
export type LoginRequest = typeof LoginRequest.static;

export const LoginResponse = t.Object({
    userId: t.Integer(),
});
export type LoginResponse = typeof LoginResponse.static;

export const RegisterRequest = t.Object({
    username: t.String(),
    "!password": t.String(),
    fullname: t.String(),
    email: t.String({ format: "email" }),
});
export type RegisterRequest = typeof RegisterRequest.static;

export const RegisterResponse = t.Object({
    message: t.String(),
});
export type RegisterResponse = typeof RegisterResponse.static;

export const LogoutResponse = t.Object({
    message: t.String(),
});
export type LogoutResponse = typeof LogoutResponse.static;
