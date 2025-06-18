import { Hono } from "hono";

import { z } from "zod/v4";
import { signupSchema } from "../../schemas/auth";

import { eq } from "drizzle-orm";
import { db, schema } from "../../db";
import { zValidator } from "@hono/zod-validator";
import { zodErrorHandler } from "../../utils/zodErrorHandler";

export const signupRoute = new Hono();

signupRoute.post(
    "/",
    zValidator("json", signupSchema, zodErrorHandler),
    async (c) => {
        const formData = c.req.valid("json");

        const [emailExists, usernameExists] = await Promise.all([
            db
                .select()
                .from(schema.users)
                .where(eq(schema.users.email, formData.email))
                .then((row) => row.length > 0),
            db
                .select()
                .from(schema.users)
                .where(eq(schema.users.username, formData.username))
                .then((row) => row.length > 0),
        ]);

        if (emailExists)
            return c.json(
                { errors: { email: "Email already exists!" } },
                401
            );
        if (usernameExists)
            return c.json(
                { errors: { username: "Username already exists!" } },
                401
            );

        await db.insert(schema.users).values({
            ...formData,
            password: await Bun.password.hash(formData.password),
            avatar: formData.username.charAt(0),
        });

        return c.json({ message: "User created successfully!" }, 201);
    }
);
