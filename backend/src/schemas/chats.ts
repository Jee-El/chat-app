import { z } from "zod/v4";

export const idParamSchema = z
    .object({
        id: z.coerce.number().int().positive(),
    })
    .strict();
export type IdParam = z.infer<typeof idParamSchema>;

export const create1To1ChatSchema = z
    .object({
        otherUserId: z
            .number()
            .int({ message: "User ID must be an integer" })
            .positive({ message: "User ID must be positive" }),
    })
    .strict();
export type create1To1Chat = z.infer<typeof create1To1ChatSchema>;

export const createGroupChatSchema = z
    .object({
        name: z
            .string()
            .min(1, "Group name is required")
            .max(50, "Group name must be less than 50 characters")
            .trim(),
        description: z
            .string()
            .max(250, "Description must be less than 250 characters")
            .optional(),
        membersIds: z
            .array(
                z
                    .number()
                    .int()
                    .positive("User ID must be a positive integer")
            )
            .min(2, "Group must have at least 2 members")
            .max(100, "Cannot have more than 100 members"),
    })
    .refine(
        (data) => {
            // Check for duplicate member IDs
            const uniqueIds = new Set(data.membersIds);
            return uniqueIds.size === data.membersIds.length;
        },
        {
            message: "Duplicate member IDs are not allowed",
            path: ["memberIds"],
        }
    );
export type createGroupChat = z.infer<typeof createGroupChatSchema>;
