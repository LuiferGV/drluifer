import { z } from "zod";

const optionalText = (maxLength: number) => z.string().trim().max(maxLength);

export const patientFormSchema = z.strictObject({
  fullName: z
    .string()
    .trim()
    .min(2, "Escribe el nombre completo del paciente.")
    .max(120, "El nombre no puede superar 120 caracteres."),
  phone: z
    .string()
    .trim()
    .min(6, "Escribe un teléfono válido.")
    .max(32, "El teléfono es demasiado largo.")
    .refine((value) => value.replace(/\D/g, "").length >= 6, "El teléfono debe contener al menos 6 números."),
  birthDate: z.string().refine(
    (value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
    "Selecciona una fecha válida."
  ),
  occupation: optionalText(100),
  city: optionalText(100),
  tags: optionalText(300),
  clinicalSummary: optionalText(3000)
});

export type PatientFormInput = z.input<typeof patientFormSchema>;
export type PatientFormValues = z.output<typeof patientFormSchema>;
