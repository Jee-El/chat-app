import { Hono } from "hono";
import { db, schema } from "../../db";
import { eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { updateProfileSchema } from "../../schemas/users";
import { zodErrorHandler } from "../../utils/zodErrorHandler";
import { updatePasswordSchema } from "../../schemas/auth";
import { redis } from "bun";

export const meRoute = new Hono();

meRoute.get("/", async (c) => {
    const { id } = c.get("jwtPayload");

    const userProfile = await db.query.users.findFirst({
        columns: {
            password: false,
            isOnline: false,
            lastSeen: false,
        },
        where: eq(schema.users.id, id),
    });

    if (!userProfile) {
        return c.text("User not found.", 404);
    }

    return c.json(userProfile, 200);
});

meRoute.patch(
    "/",
    zValidator("json", updateProfileSchema, zodErrorHandler),
    async (c) => {
        const { id } = c.get("jwtPayload");
        const dataToUpdate = c.req.valid("json");

        const updatedUserProfiles = await db
            .update(schema.users)
            .set({ ...dataToUpdate })
            .where(eq(schema.users.id, id))
            .returning(schema.profileSelect);

        if (updatedUserProfiles.length === 0) {
            return c.text("User not found.", 404);
        }

        const updatedUserProfile = updatedUserProfiles[0];

        return c.json(updatedUserProfile, 200);
    }
);

meRoute.patch(
    "/password",
    zValidator("json", updatePasswordSchema, zodErrorHandler),
    async (c) => {
        const { id } = c.get("jwtPayload");
        const { currentPassword, newPassword } = c.req.valid("json");

        const user = await db.query.users.findFirst({
            columns: { password: true },
            where: eq(schema.users.id, id),
        });

        if (!user) {
            return c.text("User not found.", 404);
        }

        const validPassword = await Bun.password.verify(
            currentPassword,
            user.password
        );

        if (!validPassword) {
            return c.json(
                { error: "Current password is incorrect." },
                401
            );
        }

        await db
            .update(schema.users)
            .set({ password: await Bun.password.hash(newPassword) });

        return c.body(null, 204);
    }
);

meRoute.delete("/", async (c) => {
    const { id, jti, exp } = c.get("jwtPayload");

    const deletedUsers = await db
        .delete(schema.users)
        .where(eq(schema.users.id, id))
        .returning();

    if (deletedUsers.length === 0) {
        return c.text("User not found.", 404);
    }

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
