import { zodResolver } from "@hookform/resolvers/zod";
import { Save, UserRound, X } from "lucide-react";
import { useEffect, useId } from "react";
import { useForm } from "react-hook-form";
import {
  patientFormSchema,
  type PatientFormInput,
  type PatientFormValues
} from "../features/patients/patient.schema";

interface PatientModalProps {
  mode: "create" | "edit";
  initialValues: PatientFormInput;
  onSubmit: (values: PatientFormValues) => void;
  onClose: () => void;
}

export function PatientModal({ mode, initialValues, onSubmit, onClose }: PatientModalProps) {
  const titleId = useId();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<PatientFormInput, unknown, PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: initialValues
  });

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const fieldError = (message: string | undefined, id: string) =>
    message ? (
      <small id={id} className="modal-field__error" role="alert">
        {message}
      </small>
    ) : null;

  return (
    <div className="modal-shell" role="presentation">
      <button type="button" className="modal-backdrop" aria-label="Cerrar modal" onClick={onClose} />

      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="modal-card__header">
          <div>
            <p className="eyebrow">Gestión clínica</p>
            <h2 id={titleId}>{mode === "create" ? "Nuevo paciente" : "Editar ficha"}</h2>
            <p className="modal-card__subtitle">
              {mode === "create"
                ? "Crea una ficha clínica con datos validados antes de guardarla."
                : "Actualiza los datos generales del paciente de forma segura."}
            </p>
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>
            <X className="button-icon" aria-hidden="true" size={18} />
            Cerrar
          </button>
        </header>

        <form className="modal-form" noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-form__grid">
            <label className="modal-field">
              <span className="modal-field__label">
                <UserRound aria-hidden="true" size={17} />
                Nombre y apellido
              </span>
              <input
                type="text"
                autoComplete="name"
                placeholder="Ej.: Juan Pérez"
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={errors.fullName ? "patient-name-error" : undefined}
                {...register("fullName")}
              />
              {fieldError(errors.fullName?.message, "patient-name-error")}
            </label>

            <label className="modal-field">
              <span>Teléfono</span>
              <input
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="+595981123456"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "patient-phone-error" : undefined}
                {...register("phone")}
              />
              {fieldError(errors.phone?.message, "patient-phone-error")}
            </label>

            <label className="modal-field">
              <span>Fecha de nacimiento</span>
              <input
                type="date"
                aria-invalid={Boolean(errors.birthDate)}
                aria-describedby={errors.birthDate ? "patient-birth-error" : undefined}
                {...register("birthDate")}
              />
              {fieldError(errors.birthDate?.message, "patient-birth-error")}
            </label>

            <label className="modal-field">
              <span>Ocupación</span>
              <input
                type="text"
                placeholder="Ej.: Arquitecta"
                aria-invalid={Boolean(errors.occupation)}
                aria-describedby={errors.occupation ? "patient-occupation-error" : undefined}
                {...register("occupation")}
              />
              {fieldError(errors.occupation?.message, "patient-occupation-error")}
            </label>

            <label className="modal-field">
              <span>Ciudad</span>
              <input
                type="text"
                autoComplete="address-level2"
                placeholder="Ej.: Asunción"
                aria-invalid={Boolean(errors.city)}
                aria-describedby={errors.city ? "patient-city-error" : undefined}
                {...register("city")}
              />
              {fieldError(errors.city?.message, "patient-city-error")}
            </label>

            <label className="modal-field">
              <span>Etiquetas</span>
              <input
                type="text"
                placeholder="Periodoncia, Control, WhatsApp"
                aria-invalid={Boolean(errors.tags)}
                aria-describedby={errors.tags ? "patient-tags-error" : undefined}
                {...register("tags")}
              />
              {fieldError(errors.tags?.message, "patient-tags-error")}
            </label>

            <label className="modal-field modal-field--full">
              <span>Resumen clínico</span>
              <textarea
                rows={5}
                placeholder="Resumen rápido del estado del paciente"
                aria-invalid={Boolean(errors.clinicalSummary)}
                aria-describedby={errors.clinicalSummary ? "patient-summary-error" : undefined}
                {...register("clinicalSummary")}
              />
              {fieldError(errors.clinicalSummary?.message, "patient-summary-error")}
            </label>
          </div>

          <footer className="modal-card__footer">
            <button type="button" className="outline-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              <Save className="button-icon" aria-hidden="true" size={18} />
              {mode === "create" ? "Guardar paciente" : "Guardar cambios"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
