import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { idParamSchema } from "../../../../schemas";
import { zodErrorHandler } from "../../../../utils/zodErrorHandler";
import { db, schema } from "../../../../db";
import { and, eq, ne, sql } from "drizzle-orm";

export const acceptRequestRoute = new Hono();

acceptRequestRoute.patch(
    "/",
    zValidator("param", idParamSchema, zodErrorHandler),
    async (c) => {
        const { id } = c.get("jwtPayload");
        const requestId = c.req.valid("param").id;

        const result = await db.transaction(async (tx) => {
            const [acceptedRequest] = await db
                .update(schema.friendRequests)
                .set({
                    status: "ACCEPTED" as const,
                    updatedAt: sql`now()`,
                })
                .where(
                    and(
                        eq(schema.friendRequests.senderId, id),
                        eq(schema.friendRequests.id, requestId),
                        eq(
                            schema.friendRequests.status,
                            "PENDING" as const
                        )
                    )
                )
                .returning({
                    updatedId: schema.friendRequests.id,
                    senderId: schema.friendRequests.senderId,
                    receiverId: schema.friendRequests.receiverId,
                });

            if (!acceptedRequest) {
                return { success: false, error: "Request not found" };
            }

            await db.insert(schema.friends).values([
                {
                    userId: acceptedRequest.senderId,
                    friendId: acceptedRequest.receiverId,
                },
                {
                    userId: acceptedRequest.receiverId,
                    friendId: acceptedRequest.senderId,
                },
            ]);

            return { success: true, data: { requestId } };
        });

        return c.json(result, result.success ? 201 : 404);
    }
);
