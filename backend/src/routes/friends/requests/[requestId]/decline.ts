import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { idParamSchema } from "../../../../schemas";
import { zodErrorHandler } from "../../../../utils/zodErrorHandler";
import { db, schema } from "../../../../db";
import { and, eq, sql } from "drizzle-orm";

export const declineRequestRoute = new Hono();

declineRequestRoute.patch(
    "/",
    zValidator("param", idParamSchema, zodErrorHandler),
    async (c) => {
        const { id } = c.get("jwtPayload");
        const requestId = c.req.valid("param").id;

        const [declinedRequest] = await db
            .update(schema.friendRequests)
            .set({
                status: "DECLINED" as const,
                updatedAt: sql`now()`,
            })
            .where(
                and(
                    eq(schema.friendRequests.senderId, id),
                    eq(schema.friendRequests.id, requestId),
                    eq(schema.friendRequests.status, "PENDING" as const)
                )
            )
            .returning({ updatedId: schema.friendRequests.id });

        if (!declinedRequest) {
            return c.json(
                {
                    success: false,
                    error: "Request not found",
                },
                404
            );
        }

        return c.json({ success: true, data: { requestId } });
    }
);
