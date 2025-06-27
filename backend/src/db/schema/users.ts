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
    avatar: text().notNull(),
    about: varchar({ length: 100 }).default(
        "Hey there! I am using ChatApp."
    ),
    lastSeen: timestamp("last_seen").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const profileSelect = {
    id: users.id,
    username: users.username,
    email: users.email,
    firstName: users.firstName,
    lastName: users.lastName,
    avatar: users.avatar,
    about: users.about,
    createdAt: users.createdAt,
};

export const { email, ...publicUserSelect } = {
    ...profileSelect,
    lastSeen: users.lastSeen,
};
