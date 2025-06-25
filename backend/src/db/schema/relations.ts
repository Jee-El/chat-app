import { relations } from "drizzle-orm";
import { users } from "./users";
import { chats } from "./chats";
import { messages } from "./messages";
import { chatMembers } from "./chatMembers";
import { messageStatuses } from "./messageStatuses";
import { friends } from "./friends";

export const usersRelations = relations(users, ({ many }) => ({
    sentMessages: many(messages),
    chatMembers: many(chatMembers),
    messageStatuses: many(messageStatuses),
    friends: many(friends, { relationName: "userFriends" }),
    createdChats: many(chats),
}));

export const chatsRelations = relations(chats, ({ many }) => ({
    members: many(chatMembers),
    messages: many(messages),
}));

export const chatMembersRelations = relations(chatMembers, ({ one }) => ({
    user: one(users, {
        fields: [chatMembers.userId],
        references: [users.id],
    }),
    chat: one(chats, {
        fields: [chatMembers.chatId],
        references: [chats.id],
    }),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
    sender: one(users, {
        fields: [messages.senderId],
        references: [users.id],
    }),
    chat: one(chats, {
        fields: [messages.chatId],
        references: [chats.id],
    }),
    replyTo: one(messages, {
        fields: [messages.replyToId],
        references: [messages.id],
    }),
    replies: many(messages),
    statuses: many(messageStatuses),
}));

export const messageStatusesRelations = relations(
    messageStatuses,
    ({ one }) => ({
        message: one(messages, {
            fields: [messageStatuses.messageId],
            references: [messages.id],
        }),
        user: one(users, {
            fields: [messageStatuses.userId],
            references: [users.id],
        }),
    })
);

export const friendsRelations = relations(friends, ({ one }) => ({
    user: one(users, {
        fields: [friends.userId],
        references: [users.id],
    }),
    friend: one(users, {
        fields: [friends.friendId],
        references: [users.id],
    }),
}));
