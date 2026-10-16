import { z } from "zod";

export const loginSchema = z.strictObject({
  email: z
    .string()
    .trim()
    .min(1, "Ingresa tu email.")
    .email("Escribe un email válido."),
  password: z
    .string()
    .min(1, "Ingresa tu contraseña.")
    .max(256, "La contraseña es demasiado larga.")
});

export type LoginFormInput = z.input<typeof loginSchema>;
export type LoginFormValues = z.output<typeof loginSchema>;
