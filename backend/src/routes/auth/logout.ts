import { Hono } from "hono";
import { redis } from "bun";

export const logoutRoute = new Hono();

logoutRoute.post("/", async (c) => {
    const { jti, exp } = c.get("jwtPayload");

    const ttl = exp - Math.floor(Date.now() / 1000);

    await redis.set(jti, "blacklisted");
    await redis.expire(jti, ttl);

    return c.body(null, 204);
});
