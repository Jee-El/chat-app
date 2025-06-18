import { z } from "zod/v4";

export const updateProfileSchema = z
    .object({
        username: z.string().min(3).max(20).optional(),
        email: z.email().optional(),
        firstName: z.string().nonempty().optional(),
        lastName: z.string().nonempty().optional(),
        about: z.string().min(1).max(100).optional(),
    })
    .strict();
