import { Hono } from "hono";
import { redis } from "bun";

export const logoutRoute = new Hono();

logoutRoute.post("/", async (c) => {
    const { jti, exp } = c.get("jwtPayload");

    const ttl = exp - Math.floor(Date.now() / 1000);

    // This check is just for exteremely rare edge case where
    // the token expires right after it's validated by jwt
    // middleware, and before this chunk of code runs
    if (ttl > 0) {
        await redis.set(jti, "blacklisted");
        await redis.expire(jti, ttl);
    }

    return c.body(null, 204);
});
