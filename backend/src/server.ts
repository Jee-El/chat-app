import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { authRoutes } from "./routes/auth";
import { jwt } from "hono/jwt";
import { showRoutes } from "hono/dev";

const app = new Hono();

app.onError((err, c) => {
    console.log("Unhandled error: ", err);
    return c.json({ error: "Internal Server Error" }, 500);
});

app.use(
    "*",
    logger(),
    cors({
        origin: ["http://localhost:5173"],
        allowMethods: ["GET", "POST", "OPTIONS"],
        maxAge: 600,
        credentials: true,
    })
);

app.use("/api/*", jwt({ secret: Bun.env.SECRET_KEY }));

app.route("/auth", authRoutes);

app.get("/", (c) => {
    return c.text("Hello Hono!");
});

showRoutes(app);

export default app;
