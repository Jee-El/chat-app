import { Hono } from "hono";
import { db, schema } from "../../db";
import { and, eq, inArray, or } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { idParamSchema } from "../../schemas";
import { zodErrorHandler } from "../../utils/zodErrorHandler";

export const friendRoute = new Hono();

friendRoute.delete(
    "/",
    zValidator("param", idParamSchema, zodErrorHandler),
    async (c) => {
        const { id } = c.get("jwtPayload");
        const friendId = c.req.valid("param").id;

        const isFriend = await db.query.friends.findFirst({
            columns: { id: true },
            where: and(
                eq(schema.friends.userId, id),
                eq(schema.friends.friendId, friendId)
            ),
        });

        if (!isFriend) {
            return c.json({ success: false, error: "Friend not found" });
        }

        const result = await db.transaction(async (tx) => {
            const removedFriendsRows = await tx
                .delete(schema.friends)
                .where(
                    or(
                        and(
                            eq(schema.friends.userId, id),
                            eq(schema.friends.friendId, friendId)
                        ),
                        and(
                            eq(schema.friends.userId, friendId),
                            eq(schema.friends.friendId, id)
                        )
                    )
                )
                .returning({ id: schema.friends.id });

            if (!(removedFriendsRows.length === 2)) {
                return { success: false, error: "Friend not found" };
            }

            await tx
                .delete(schema.friendRequests)
                .where(
                    or(
                        inArray(schema.friendRequests.senderId, [
                            id,
                            friendId,
                        ])
                    )
                );
            return { success: true, data: null };
        });

        return c.json(result, result.success ? 201 : 404);
    }
);
