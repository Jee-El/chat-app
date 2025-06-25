import {
    pgTable,
    text,
    timestamp,
    boolean,
    integer,
    serial,
    foreignKey,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { chats } from "./chats";

export const messages = pgTable(
    "messages",
    {
        id: serial().primaryKey(),
        content: text().notNull(),
        senderId: integer("sender_id")
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        chatId: integer("chat_id")
            .references(() => chats.id, { onDelete: "cascade" })
            .notNull(),
        replyToId: integer("reply_to_id"),
        isDeleted: boolean("is_deleted").default(false).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.replyToId],
            foreignColumns: [table.id],
        }).onDelete("set null"),
    ]
);
