import {
    pgTable,
    timestamp,
    integer,
    pgEnum,
    serial,
    unique,
} from "drizzle-orm/pg-core";

import { users } from "./users"


export const friendRequestStatusEnum = pgEnum("request_status", [
    "PENDING",
    "ACCEPTED",
    "DECLINED",
]);


export const friendRequests = pgTable(
    "friend_requests",
    {
        id: serial().primaryKey(),
        senderId: integer("sender_id")
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        receiverId: integer("receiver_id")
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        status: friendRequestStatusEnum().default("PENDING").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        uniqueRequest: unique().on(table.senderId, table.receiverId),
    })
);