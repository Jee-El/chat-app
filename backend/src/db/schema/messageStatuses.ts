import {
    pgTable,
    timestamp,
    integer,
    pgEnum,
    serial,
} from "drizzle-orm/pg-core";

import { users } from "./users"
import { messages } from "./messages"

export const messageStatusEnum = pgEnum("message_status", [
    "SENT",
    "DELIVERED",
    "READ",
]);

export const messageStatuses = pgTable("message_statuses", {
    id: serial().primaryKey(),
    messageId: integer("message_id")
        .references(() => messages.id, { onDelete: "cascade" })
        .notNull(),
    userId: integer("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    status: messageStatusEnum().notNull(),
    timestamp: timestamp().defaultNow().notNull(),
});