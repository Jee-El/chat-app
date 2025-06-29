import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { zodErrorHandler } from "../../utils/zodErrorHandler";
import { create1To1ChatSchema } from "../../schemas/chats";
import { eq } from "drizzle-orm";
import { db, schema } from "../../db";

export const oneToOneChatRoute = new Hono();

oneToOneChatRoute.post(
    "/",
    zValidator("json", create1To1ChatSchema, zodErrorHandler),
    async (c) => {
        const { id } = c.get("jwtPayload");
        const { otherUserId } = c.req.valid("json");

        const otherUser = await db.query.users.findFirst({
            where: eq(schema.users.id, otherUserId),
        });

        if (!otherUser) {
            return c.json(
                { success: false, error: "User not found" },
                404
            );
        }

        const chatAlreadyExists = await db.query.chatMembers.findFirst({
            where: eq(schema.chatMembers.userId, id),
            with: {
                chat: { columns: { id: true } },
            },
        });

        if (chatAlreadyExists) {
            return c.json(
                {
                    success: true,
                    data: { chatId: chatAlreadyExists.id },
                },
                200
            );
        }

        const chatId = await db.transaction(async (tx) => {
            const [newChat] = await db
                .insert(schema.chats)
                .values({
                    name: otherUser.firstName + " " + otherUser.lastName,
                    avatar: otherUser.username.charAt(0),
                    createdBy: id,
                })
                .returning({ id: schema.chats.id });

            await db.insert(schema.chatMembers).values({
                userId: id,
                chatId: newChat.id,
            });

            await db
                .insert(schema.chatMembers)
                .values({
                    userId: otherUserId,
                    chatId: newChat.id,
                })
                .onConflictDoNothing();
            return newChat.id;
        });

        return c.json(
            {
                success: true,
                data: { chatId },
            },
            200
        );
    }
);
