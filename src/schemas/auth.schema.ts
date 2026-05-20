import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

export const RegisterSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
    "Password must be at least 8 characters and include uppercase, lowercase, and a number."
  ),
  name: z.string().min(1, {
    message: "Name is required",
  }),
});

export const NewPasswordSchema = z.object({
  password: z.string().regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
    "Password must be at least 8 characters and include uppercase, lowercase, and a number."
  ),
});
