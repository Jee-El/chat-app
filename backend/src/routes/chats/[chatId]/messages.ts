import { Hono } from "hono";
import { db, schema } from "../../../db";
import { and, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { idParamSchema } from "../../../schemas";
import {
    messageSchema,
    messagesQuerySchema,
} from "../../../schemas/messages";
import { zValidator } from "@hono/zod-validator";
import { zodErrorHandler } from "../../../utils/zodErrorHandler";

export const chatRoute = new Hono();

chatRoute.get(
    "/messages",
    zValidator("param", idParamSchema, zodErrorHandler),
    zValidator("query", messagesQuerySchema, zodErrorHandler),
    async (c) => {
        const { id } = c.get("jwtPayload");
        const chatId = c.req.valid("param").id;
        const { limit, offset } = c.req.valid("query");

        const isMemberOfChat = await db.query.chatMembers.findFirst({
            where: and(
                eq(schema.chatMembers.userId, id),
                eq(schema.chatMembers.chatId, chatId)
            ),
            columns: { id: true },
        });

        if (!isMemberOfChat) {
            return c.json(
                { success: false, error: "Chat not found" },
                404
            );
        }

        const [chatWithMembers, messages] = await Promise.all([
            db.query.chats.findFirst({
                where: eq(schema.chats.id, chatId),
                columns: {
                    updatedAt: false,
                },
                with: {
                    members: {
                        with: {
                            user: {
                                columns: {
                                    email: false,
                                    password: false,
                                },
                            },
                        },
                    },
                },
            }),
            db.query.messages.findMany({
                where: eq(schema.messages.chatId, chatId),
                orderBy: [desc(schema.messages.createdAt)],
                limit: limit + 1,
                offset: offset,
                with: {
                    sender: {
                        columns: {
                            id: true,
                            username: true,
                            avatar: true,
                        },
                    },
                    replyTo: {
                        columns: {
                            id: true,
                            content: true,
                            createdAt: true,
                        },
                        with: {
                            sender: {
                                columns: {
                                    id: true,
                                    username: true,
                                },
                            },
                        },
                    },
                    statuses: {
                        where: eq(schema.messageStatuses.userId, id),
                        columns: {
                            status: true,
                            timestamp: true,
                        },
                    },
                },
            }),
        ]);

        const hasMore = messages.length > limit;
        const paginatedMessages = hasMore
            ? messages.slice(0, limit)
            : messages;

        const { members, ...chat } = chatWithMembers!;

        return c.json(
            {
                success: true,
                data: {
                    chat,
                    members,
                    messages: paginatedMessages,
                    pagination: {
                        limit,
                        offset,
                        hasMore,
                    },
                },
            },
            200
        );
    }
);

chatRoute.post(
    "/messages",
    zValidator("param", idParamSchema, zodErrorHandler),
    zValidator("json", messageSchema, zodErrorHandler),
    async (c) => {
        const { id } = c.get("jwtPayload");
        const chatId = c.req.valid("param").id;
        const { content, replyToId } = c.req.valid("json");

        const isMemberOfChat = await db.query.chatMembers.findFirst({
            where: and(
                eq(schema.chatMembers.userId, id),
                eq(schema.chatMembers.chatId, chatId)
            ),
            columns: { id: true },
        });

        if (!isMemberOfChat) {
            return c.json(
                { success: false, error: "Access denied" },
                403
            );
        }

        if (replyToId) {
            const replyMessage = await db.query.messages.findFirst({
                where: eq(schema.messages.id, replyToId),
                columns: { chatId: true },
            });

            if (!replyMessage || replyMessage.chatId !== chatId) {
                return c.json(
                    { success: false, error: "Invalid request" },
                    400
                );
            }
        }

        const [newMessage] = await db
            .insert(schema.messages)
            .values({
                content,
                senderId: id,
                chatId,
                replyToId,
            })
            .returning();

        await db
            .update(schema.chats)
            .set({ updatedAt: sql`now()` })
            .where(eq(schema.chats.id, chatId));

        const chatMembers = await db.query.chatMembers.findMany({
            where: and(
                eq(schema.chatMembers.chatId, chatId),
                ne(schema.chatMembers.userId, id)
            ),
            columns: { userId: true },
        });

        if (chatMembers.length > 0) {
            await db.insert(schema.messageStatuses).values(
                chatMembers.map((member) => ({
                    messageId: newMessage.id,
                    userId: member.userId,
                }))
            );
        }

        return c.json({ success: true, data: { newMessage } }, 201);
    }
);

chatRoute.post(
    "/messages/read",
    zValidator("param", idParamSchema, zodErrorHandler),
    async (c) => {
        const { id } = c.get("jwtPayload");
        const chatId = c.req.valid("param").id;

        const isMemberOfChat = await db.query.chatMembers.findFirst({
            where: and(
                eq(schema.chatMembers.userId, id),
                eq(schema.chatMembers.chatId, chatId)
            ),
            columns: { id: true },
        });

        if (!isMemberOfChat) {
            return c.json(
                { success: false, error: "Access denied" },
                403
            );
        }

        await db
            .update(schema.messageStatuses)
            .set({ status: "READ", timestamp: new Date() })
            .where(
                and(
                    eq(schema.messageStatuses.userId, id),
                    inArray(
                        schema.messageStatuses.messageId,
                        db
                            .select({ id: schema.messages.id })
                            .from(schema.messages)
                            .where(eq(schema.messages.chatId, chatId))
                    ),
                    ne(schema.messageStatuses.status, "READ")
                )
            );
        return c.json({success: true, data: null}, 200);
    }
);
