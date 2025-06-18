import type { Context } from "hono";
import { z } from "zod/v4";

export const zodErrorHandler = (result, c: Context) => {
    if (!result.success) {
        return c.json({
            errors: z.flattenError(result.error).fieldErrors,
        });
    }

    return result.data;
};
