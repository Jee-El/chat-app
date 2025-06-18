import { z } from "zod/v4";

export const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
    );

export const updatePasswordSchema = z
    .object({
        currentPassword: z.string().nonempty(),
        newPassword: passwordSchema,
    })
    .strict();

export const signupSchema = z
    .object({
        username: z.string().min(3).max(20),
        email: z.email(),
        password: passwordSchema,
        firstName: z.string().nonempty(),
        lastName: z.string().nonempty(),
    })
    .strict();

export type SignupForm = z.infer<typeof signupSchema>;

export const loginSchema = z
    .object({
        username: z.string().optional().default(""),
        email: z.email().optional().default(""),
        password: z.string().nonempty(),
    })
    .refine(({ username, email }) => username || email, {
        error: "Username or Email is required",
    })
    .strict();

export type LoginForm = z.infer<typeof loginSchema>;
