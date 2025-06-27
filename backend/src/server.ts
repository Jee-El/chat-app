import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import { jwt } from "hono/jwt";
import { showRoutes } from "hono/dev";

import { redis } from "bun";

import { authRoutes } from "./routes/auth";
import { usersRoute } from "./routes/users";
import { chatsRoute } from "./routes/chats";
import { messagesRoute } from "./routes/messages";

const app = new Hono();

const jwtBlackListingMiddleWare = createMiddleware(async (c, next) => {
    const { jti } = c.get("jwtPayload");

    const isBlacklisted = await redis.get(jti);

    if (isBlacklisted) {
        return c.text("Unauthorized", 401);
    }

    await next();
});

app.onError((err, c) => {
    console.log("Unhandled error: ", err);
    return c.json({ error: "Internal Server Error" }, 500);
});

app.use(
    "*",
    logger(),
    cors({
        origin: ["http://localhost:5173"],
        allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
        maxAge: 600,
        credentials: true,
    })
);

app.use(
    "/api/*",
    jwt({ secret: Bun.env.SECRET_KEY }),
    jwtBlackListingMiddleWare
);

app.use("/auth/logout", jwt({ secret: Bun.env.SECRET_KEY }));

app.route("/auth", authRoutes);
app.route("/api/users", usersRoute);
app.route("/api/chats", chatsRoute);
app.route("/api/messages", messagesRoute);

app.get("/", (c) => {
    return c.text("Hello Hono!");
});

showRoutes(app);

export default app;
