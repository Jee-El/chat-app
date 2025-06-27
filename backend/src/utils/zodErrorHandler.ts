import type { Context } from "hono";
import { z } from "zod/v4";

export const zodErrorHandler = (result, c: Context) => {
    if (!result.success) {
        console.log(result, c);
        return c.json({
            success: false,
            error: "Validation failed",
            issues: z.flattenError(result.error).fieldErrors,
        });
    }

    return result.data;
};
