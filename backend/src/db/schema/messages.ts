import {
    pgTable,
    text,
    timestamp,
    boolean,
    integer,
    serial,
} from "drizzle-orm/pg-core";

import { users } from "./users"
import { chats } from "./chats"


export const messages = pgTable("messages", {
    id: serial().primaryKey(),
    content: text(),
    senderId: integer("sender_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    chatId: integer("chat_id")
        .references(() => chats.id, { onDelete: "cascade" })
        .notNull(),
    replyToId: integer("reply_to_id").references(() => messages.id),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});