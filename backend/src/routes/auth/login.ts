import { Hono } from "hono";
import { loginSchema } from "../../schemas/schema";
import z from "zod/v4";
import { users } from "../../db/schema";
import { eq, or } from "drizzle-orm";
import { db } from "../../db";
import { SignJWT } from "jose";

export const loginRoute = new Hono();

loginRoute.post("/", async (c) => {
    const data = await c.req.json();
    const parsed = loginSchema.safeParse(data);

    if (!parsed.success) {
        return c.json({
            errors: z.flattenError(parsed.error).fieldErrors,
        });
    }
    const formData = parsed.data;

    const user = await db.query.users.findFirst({
        where: or(
            eq(users.email, formData.email),
            eq(users.username, formData.username)
        ),
    });

    if (!user) {
        const invalidField = formData.email ? "email" : "username";
        return c.json(
            {
                errors: {
                    [invalidField]: `Invalid ${invalidField}!`,
                },
            },
            401
        );
    }

    const validPassword = await Bun.password.verify(
        formData.password,
        user.password
    );

    if (!validPassword)
        return c.json({
            errors: { password: "Invalid password!" },
        });

    const accessToken = await new SignJWT({
        id: user.id,
        email: user.email,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("20mins")
        .sign(new TextEncoder().encode(Bun.env.SECRET_KEY));

    return c.json({ accessToken }, 200);
});
