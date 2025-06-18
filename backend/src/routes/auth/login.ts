import { Hono } from "hono";
import { loginSchema } from "../../schemas/auth";
import { z } from "zod/v4";
import { zValidator } from "@hono/zod-validator";
import { eq, or } from "drizzle-orm";
import { db, schema } from "../../db";
import { SignJWT } from "jose";
import { zodErrorHandler } from "../../utils/zodErrorHandler";

export const loginRoute = new Hono();

loginRoute.post(
    "/",
    zValidator("json", loginSchema, zodErrorHandler),
    async (c) => {
        const formData = c.req.valid("json");

        const user = await db.query.users.findFirst({
            where: or(
                eq(schema.users.email, formData.email),
                eq(schema.users.username, formData.username)
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
    }
);
