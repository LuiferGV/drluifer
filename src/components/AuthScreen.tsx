import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck
} from "lucide-react";
import { useForm } from "react-hook-form";
import {
  loginSchema,
  type LoginFormInput,
  type LoginFormValues
} from "../features/auth/auth.schema";

interface AuthScreenProps {
  sessionState: "not-configured" | "loading" | "signed-out" | "error";
  authError: string | null;
  isSubmitting: boolean;
  onSubmit: (values: LoginFormValues) => void | Promise<unknown>;
}

export function AuthScreen({
  sessionState,
  authError,
  isSubmitting,
  onSubmit
}: AuthScreenProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormInput, unknown, LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const title =
    sessionState === "not-configured" ? "Falta configurar Firebase" : "Acceso privado del consultorio";
  const subtitle =
    sessionState === "not-configured"
      ? "Carga las variables de Firebase para usar la base real del sistema."
      : "Ingresa con tu email y contraseña para abrir pacientes, atenciones, alertas y finanzas.";

  const helperText =
    sessionState === "loading"
      ? "Verificando si ya existe una sesión activa..."
      : sessionState === "error"
        ? "Firebase respondió con un problema de autenticación."
        : "Solo los usuarios autorizados pueden entrar al panel clínico.";

  const isDisabled = sessionState === "not-configured" || sessionState === "loading" || isSubmitting;

  return (
    <div className="auth-shell min-h-dvh bg-clinic-canvas text-clinic-foreground antialiased">
      <div className="page-backdrop" />

      <section className="auth-stage isolate">
        <div className="auth-hero">
          <p className="eyebrow">Dr. Luifer</p>
          <div className="brand-mark brand-mark--hero" aria-hidden="true">
            <span className="brand-mark__dark">L</span>
            <span className="brand-mark__gold">G</span>
          </div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
          <div className="auth-highlights">
            <article className="quick-card">
              <ShieldCheck aria-hidden="true" size={22} strokeWidth={1.8} />
              <strong>Pacientes protegidos</strong>
              <span>La base clínica solo se abre con autenticación activa en Firebase.</span>
            </article>
            <article className="quick-card">
              <Activity aria-hidden="true" size={22} strokeWidth={1.8} />
              <strong>Sincronización en tiempo real</strong>
              <span>La información se mantiene disponible entre equipos y sesiones autorizadas.</span>
            </article>
          </div>
        </div>

        <section className="auth-card">
          <p className="eyebrow">Ingreso seguro</p>
          <h2>Panel del consultorio</h2>
          <p className="auth-card__subtitle">{helperText}</p>

          <form className="auth-form" noValidate onSubmit={handleSubmit(onSubmit)}>
            <label className="modal-field">
              <span className="modal-field__label">
                <Mail aria-hidden="true" size={17} strokeWidth={1.8} />
                Email
              </span>
              <input
                type="email"
                placeholder="tuemail@consultorio.com"
                autoComplete="email"
                inputMode="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "login-email-error" : undefined}
                disabled={isDisabled}
                {...register("email")}
              />
              {errors.email ? (
                <small id="login-email-error" className="modal-field__error" role="alert">
                  {errors.email.message}
                </small>
              ) : null}
            </label>

            <label className="modal-field">
              <span className="modal-field__label">
                <LockKeyhole aria-hidden="true" size={17} strokeWidth={1.8} />
                Contraseña
              </span>
              <input
                type="password"
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "login-password-error" : undefined}
                disabled={isDisabled}
                {...register("password")}
              />
              {errors.password ? (
                <small id="login-password-error" className="modal-field__error" role="alert">
                  {errors.password.message}
                </small>
              ) : null}
            </label>

            {authError ? (
              <p className="auth-form__error" role="alert">
                {authError}
              </p>
            ) : null}

            <button
              type="submit"
              className="primary-button auth-form__submit gap-2"
              disabled={isDisabled}
            >
              {isSubmitting ? (
                <LoaderCircle className="animate-spin" aria-hidden="true" size={18} />
              ) : (
                <LogIn aria-hidden="true" size={18} />
              )}
              {isSubmitting ? "Validando acceso..." : "Ingresar al sistema"}
            </button>
          </form>
        </section>
      </section>
    </div>
  );
}
