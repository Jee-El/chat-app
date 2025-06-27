import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { idParamSchema } from "../../schemas/chats";
import { zodErrorHandler } from "../../utils/zodErrorHandler";
import { eq } from "drizzle-orm";
import { db, schema } from "../../db";

export const messageRoute = new Hono();

messageRoute.delete(
    "/:messageId",
    zValidator("json", idParamSchema, zodErrorHandler),
    async (c) => {
        const { id } = c.get("jwtPayload");
        const messageId = c.req.valid("json").id;

        const belongToUser = await db.query.messages.findFirst({
            where: eq(schema.messages.senderId, id),
        });

        if (!belongToUser) {
            return c.json(
                { success: false, error: "Access denied" },
                403
            );
        }

        await db.transaction(async (tx) => {
            await Promise.all([
                await db.update(schema.messages).set({
                    content: "This message was deleted",
                    isDeleted: true,
                }),
                await db
                    .delete(schema.messageStatuses)
                    .where(
                        eq(schema.messageStatuses.messageId, messageId)
                    ),
            ]);
        });
        return c.body(null, 204);
    }
);
