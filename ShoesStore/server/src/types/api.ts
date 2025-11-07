import { t, TSchema } from "elysia";

export const UnsuccessfulAPIResponse = t.Object({
    error: t.String(),
});
export type UnsuccessfulAPIResponse = typeof UnsuccessfulAPIResponse.static;
