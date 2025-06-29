import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { idParamSchema } from "../../schemas";
import { zodErrorHandler } from "../../utils/zodErrorHandler";
import { eq } from "drizzle-orm";
import { db, schema } from "../../db";
import { success } from "zod/v4";

export const messageRoute = new Hono();

messageRoute.delete(
    "/",
    zValidator("param", idParamSchema, zodErrorHandler),
    async (c) => {
        const { id } = c.get("jwtPayload");
        const messageId = c.req.valid("param").id;

        const belongToUser = await db.query.messages.findFirst({
            columns: { id: true },
            where: eq(schema.messages.senderId, id),
        });

        if (!belongToUser) {
            return c.json(
                { success: false, error: "Message not found" },
                404
            );
        }

        await db.transaction(async (tx) => {
            await Promise.all([
                await db
                    .update(schema.messages)
                    .set({
                        content: "This message was deleted",
                        isDeleted: true,
                    })
                    .where(eq(schema.messages.id, messageId)),
                await db
                    .delete(schema.messageStatuses)
                    .where(
                        eq(schema.messageStatuses.messageId, messageId)
                    ),
            ]);
        });
        return c.json({ success: true, data: null }, 200);
    }
);
