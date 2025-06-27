import { Hono } from "hono";
import { db, schema } from "../../db";
import { desc, eq } from "drizzle-orm";
import { chatRoute } from "./[chatId]/messages";


export const chatsRoute = new Hono();

chatsRoute.route("/:chatId", chatRoute);

chatsRoute.get("/", async (c) => {
    const { id } = c.get("jwtPayload");

    const userChats = await db
        .select({
            chat: schema.chats,
            member: schema.chatMembers,
        })
        .from(schema.chatMembers)
        .innerJoin(
            schema.chats,
            eq(schema.chatMembers.chatId, schema.chats.id)
        )
        .where(eq(schema.chatMembers.userId, id))
        .orderBy(desc(schema.chats.updatedAt));

    return c.json({ success: true, userChats }, 200);
});
