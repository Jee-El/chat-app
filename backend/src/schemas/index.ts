import { z } from "zod/v4";

export const idParamSchema = z
    .object({
        id: z.coerce.number().int().positive(),
    })
    .strict();
export type IdParam = z.infer<typeof idParamSchema>;
