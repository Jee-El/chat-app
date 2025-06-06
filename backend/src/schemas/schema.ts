import { z } from "zod/v4";

const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
    );

export const signupSchema = z.object({
    username: z.string().max(20).nonempty(),
    email: z.email(),
    password: passwordSchema,
    firstName: z.string().nonempty(),
    lastName: z.string().nonempty(),
});

export type SignupForm = z.infer<typeof signupSchema>;

export const loginSchema = z
    .object({
        username: z.string().optional().default(""),
        email: z.email().optional().default(""),
        password: passwordSchema,
    })
    .refine(({ username, email }) => username || email, {
        error: "Username or Email is required",
    });

export type LoginForm = z.infer<typeof loginSchema>;
