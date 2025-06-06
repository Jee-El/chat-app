import {
    pgTable,
    text,
    timestamp,
    integer,
    serial,
    unique,
} from "drizzle-orm/pg-core";

import { users } from "./users"

export const friends = pgTable(
    "friends",
    {
        id: serial().primaryKey(),
        userId: integer("user_id")
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        friendId: integer("friend_id")
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        name: text().notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => {
        return {
            uniqueFriendship: unique().on(table.userId, table.friendId),
        };
    }
);