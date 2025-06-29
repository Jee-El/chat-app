import { Hono } from "hono";
import { db, schema } from "../../db";
import { desc, eq } from "drizzle-orm";
import { chatRoute } from "./[chatId]/messages";
import { groupChatRoute } from "./group";
import { oneToOneChatRoute } from "./one-to-one";

export const chatsRoute = new Hono();

chatsRoute.route("/:chatId", chatRoute);
chatsRoute.route("/group", groupChatRoute);
chatsRoute.route("/one-to-one", oneToOneChatRoute);

chatsRoute.get("/", async (c) => {
    const { id } = c.get("jwtPayload");

    const chats = await db
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

    return c.json({ success: true, data: { chats } }, 200);
});
