import {
    pgTable,
    text,
    timestamp,
    boolean,
    serial,
    integer,
    varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const chats = pgTable("chats", {
    id: serial().primaryKey(),
    name: varchar({ length: 50 }),
    description: varchar({ length: 250 }),
    avatar: text(),
    isGroup: boolean("is_group").default(false).notNull(),
    createdBy: integer("created_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
