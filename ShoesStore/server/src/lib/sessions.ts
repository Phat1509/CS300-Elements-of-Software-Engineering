// TODO: implement expiry for sessions. i don't think i care enough
import Elysia, {
    getSchemaValidator,
    t,
    TSchema,
    UnwrapSchema,
    ValidationError,
} from "elysia";
import { db } from "@/db";

export interface SessionOption<Schema extends TSchema | undefined = undefined> {
    /**
     * Type strict validation for session data.
     */
    schema?: Schema;

    /**
     * The session cookie name.
     */
    cookieName?: string;

    /**
     * Function to generate the session identifier. Defaults to `crypto.randomUUID`.
     */
    generateSessionId?: () => string;
}

export const sessionPlugin =
    <const Schema extends TSchema | undefined = undefined>({
        schema,
        generateSessionId = () => crypto.randomUUID(),
    }: SessionOption<Schema>) =>
    (app: Elysia) => {
        return app
            .guard({
                cookie: t.Cookie({
                    session: t.Optional(t.String()),
                }),
            })
            .derive(async ({ cookie }) => {
                const validator = schema ? getSchemaValidator(schema) : null;
                let sessionId = cookie.session.value;

                if (sessionId) {
                    const session = await db
                        .selectFrom("sessions")
                        .select(["expires_at", "data"])
                        .where("id", "=", sessionId)
                        .executeTakeFirst();

                    if (
                        session &&
                        (session.expires_at === null ||
                            session.expires_at.valueOf() > new Date().valueOf())
                    ) {
                        if (validator && !validator.Check(session.data)) {
                            throw new ValidationError(
                                "Session",
                                validator,
                                session.data,
                            );
                        }

                        return {
                            session: session.data as UnwrapSchema<Schema>,
                        };
                    } else {
                        // Remove invalid session cookie
                        cookie.session.remove();
                    }
                }

                // Regenerate a new session if the old session had invalid data or does not exist
                sessionId = generateSessionId();

                const session = await db
                    .insertInto("sessions")
                    .values({ id: sessionId, expires_at: null, data: {} })
                    .returning("data")
                    .executeTakeFirstOrThrow();

                cookie.session.set({
                    value: sessionId,
                    maxAge: 3.154e10,
                    httpOnly: true,
                    secure: true,
                    path: "/",
                    sameSite: "lax",
                });

                return {
                    // potentially bad cast but since this is a new session we don't want to be too harsh
                    // on typing
                    session: session.data as UnwrapSchema<Schema>,
                };
            })
            .onAfterResponse(async ({ cookie, session }) => {
                const sessionId = cookie.session.value;

                if (sessionId && session) {
                    await db
                        .updateTable("sessions")
                        .set({ data: session })
                        .where("id", "=", sessionId)
                        .execute();
                }
            });
    };
