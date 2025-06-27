import { pgTable, boolean, integer, serial } from "drizzle-orm/pg-core";

import { chats } from "./chats";
import { users } from "./users";
import { unique } from "drizzle-orm/pg-core";

export const chatMembers = pgTable(
    "chat_members",
    {
        id: serial().primaryKey(),
        userId: integer("user_id")
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        chatId: integer("chat_id")
            .references(() => chats.id, { onDelete: "cascade" })
            .notNull(),
        isAdmin: boolean("is_admin").default(false).notNull(),
    },
    (table) => [
        unique("unique_userid_chatid").on(table.userId, table.chatId),
    ]
);
