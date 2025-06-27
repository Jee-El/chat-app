import { z } from "zod/v4";

export const messagesQuerySchema = z
    .object({
        limit: z.coerce
            .number()
            .int()
            .min(1, "Limit must be at least 1")
            .max(100, "Limit cannot exceed 100")
            .default(50),
        offset: z.coerce
            .number()
            .int()
            .min(0, "Offset must be 0 or greater")
            .default(0),
    })
    .strict();

export type MessagesQuery = z.infer<typeof messagesQuerySchema>;

export const messageSchema = z
    .object({
        content: z
            .string()
            .min(1, { message: "Message content cannot be empty" })
            .max(2000, {
                message: "Message content cannot exceed 2000 characters",
            })
            .transform((str) => str.trim()),

        replyToId: z
            .number()
            .int({ message: "Reply message ID must be an integer" })
            .positive({ message: "Reply message ID must be positive" })
            .optional()
            .nullable(),
    })
    .strict();

export type MessageInput = z.infer<typeof messageSchema>;
