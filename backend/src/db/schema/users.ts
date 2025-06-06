import {
    pgTable,
    text,
    timestamp,
    boolean,
    serial,
    varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial().primaryKey(),
    username: varchar({ length: 20 }).unique().notNull(),
    email: text().unique().notNull(),
    password: text().notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    avatar: text(),
    about: text().default("Hey there! I am using ChatApp."),
    isOnline: boolean("is_online").default(false).notNull(),
    lastSeen: timestamp("last_seen").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
