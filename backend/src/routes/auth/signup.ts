import { Hono } from "hono";

import { z } from "zod/v4";
import { signupSchema } from "../../schemas/schema";

import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";

export const signupRoute = new Hono();

signupRoute.post("/", async (c) => {
    const data = await c.req.json();
    const parsed = signupSchema.safeParse(data);

    if (!parsed.success) {
        return c.json({
            errors: z.flattenError(parsed.error).fieldErrors,
        });
    }

    const formData = parsed.data;

    const [emailExists, usernameExists] = await Promise.all([
        db
            .select()
            .from(users)
            .where(eq(users.email, formData.email))
            .then((row) => row.length > 0),
        db
            .select()
            .from(users)
            .where(eq(users.username, formData.username))
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

    await db.insert(users).values({
        ...formData,
        password: await Bun.password.hash(formData.password),
        avatar: formData.username.charAt(0),
    });

    return c.json({ message: "User created successfully!" }, 201);
});
