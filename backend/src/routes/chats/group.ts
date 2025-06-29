import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { zodErrorHandler } from "../../utils/zodErrorHandler";
import { createGroupChatSchema } from "../../schemas/chats";
import { inArray } from "drizzle-orm";
import { db, schema } from "../../db";

export const groupChatRoute = new Hono();

groupChatRoute.post(
    "/",
    zValidator("json", createGroupChatSchema, zodErrorHandler),
    async (c) => {
        const { id } = c.get("jwtPayload");
        const { name, description, membersIds } = c.req.valid("json");

        if (!membersIds.includes(id)) {
            membersIds.push(id);
        }

        const members = await db.query.users.findMany({
            where: inArray(schema.users.id, membersIds),
        });

        if (members.length !== membersIds.length) {
            return c.json({
                success: false,
                error: "One or more user IDs are invalid",
            });
        }

        const chatId = await db.transaction(async (tx) => {
            const [newChat] = await db
                .insert(schema.chats)
                .values({
                    name,
                    description,
                    avatar: name.charAt(0),
                    isGroup: true,
                    createdBy: id,
                })
                .returning({ id: schema.chats.id });

            for (const memberId of membersIds) {
                await db.insert(schema.chatMembers).values({
                    userId: memberId,
                    chatId: newChat.id,
                    isAdmin: memberId == id,
                });
            }

            return newChat.id;
        });

        return c.json({ success: true, data: { chatId } }, 200);
    }
);
