import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { idParamSchema } from "../../../../schemas";
import { zodErrorHandler } from "../../../../utils/zodErrorHandler";
import { db, schema } from "../../../../db";
import { and, eq } from "drizzle-orm";

export const cancelRequestRoute = new Hono();

cancelRequestRoute.delete(
    "/",
    zValidator("param", idParamSchema, zodErrorHandler),
    async (c) => {
        const { id } = c.get("jwtPayload");
        const requestId = c.req.valid("param").id;

        const [cancelledRequest] = await db
            .delete(schema.friendRequests)
            .where(
                and(
                    eq(schema.friendRequests.senderId, id),
                    eq(schema.friendRequests.id, requestId),
                    eq(schema.friendRequests.status, "PENDING" as const)
                )
            )
            .returning({ deletedId: schema.friendRequests.id });

        if (!cancelledRequest) {
            return c.json(
                {
                    success: false,
                    error: "Request not found",
                },
                404
            );
        }

        return c.json({ success: true, data: { requestId } }, 200);
    }
);
