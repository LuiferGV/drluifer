import { useEffect, useMemo, useState } from "react";
import type { TreatmentStatus } from "../types/clinic";

interface PatientOption {
  label: string;
  value: string;
}

export interface AttentionLineItemForm {
  id: string;
  category: string;
  detail: string;
  status: TreatmentStatus;
  totalAmount: string;
  paidAmount: string;
  costAmount: string;
  costCategory: string;
}

export interface AttentionFormValues {
  patientTarget: string;
  date: string;
  practitioner: string;
  note: string;
  items: AttentionLineItemForm[];
  createPatientInline: boolean;
  quickPatientName: string;
  quickPatientPhone: string;
  scheduleFollowUp: boolean;
  followUpDueDate: string;
  followUpType: string;
  followUpNotes: string;
}

interface AttentionModalProps {
  title: string;
  subtitle?: string;
  submitLabel: string;
  patientOptions: PatientOption[];
  initialValues: AttentionFormValues;
  lockPatient?: boolean;
  onSubmit: (values: AttentionFormValues) => void;
  onClose: () => void;
}

const categories = ["Consulta", "Periodoncia", "Operatoria", "Endodoncia", "Cirugia", "Implantes", "Control", "Otro"];
const statuses: TreatmentStatus[] = ["Realizado", "Planificado", "Control pendiente", "Cancelado"];
const followUpTypes = [
  "Control general",
  "Retiro de puntos",
  "Control postoperatorio",
  "Reevaluacion periodontal",
  "Mantenimiento",
  "Otro"
];

function createLineItem(): AttentionLineItemForm {
  return {
    id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    category: "Consulta",
    detail: "",
    status: "Realizado",
    totalAmount: "",
    paidAmount: "",
    costAmount: "",
    costCategory: "Laboratorio"
  };
}

export function AttentionModal({
  title,
  subtitle,
  submitLabel,
  patientOptions,
  initialValues,
  lockPatient = false,
  onSubmit,
  onClose
}: AttentionModalProps) {
  const modalId = useMemo(() => `attention-${Math.random().toString(36).slice(2, 9)}`, []);
  const [values, setValues] = useState<AttentionFormValues>(initialValues);
  const [patientDraft, setPatientDraft] = useState(() => {
    const selected = patientOptions.find((option) => option.value === initialValues.patientTarget);
    return selected?.label ?? "";
  });
  const [showPatientResults, setShowPatientResults] = useState(false);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const filteredPatients = patientOptions.filter((option) =>
    option.label.toLowerCase().includes(patientDraft.trim().toLowerCase())
  );

  const totals = useMemo(
    () =>
      values.items.reduce(
        (accumulator, item) => {
          const billed = Number(item.totalAmount || 0);
          const paid = Number(item.paidAmount || 0);
          const costs = Number(item.costAmount || 0);

          return {
            billed: accumulator.billed + billed,
            paid: accumulator.paid + paid,
            costs: accumulator.costs + costs
          };
        },
        { billed: 0, paid: 0, costs: 0 }
      ),
    [values.items]
  );

  const updateItem = (itemId: string, field: keyof AttentionLineItemForm, nextValue: string) => {
    setValues((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === itemId ? { ...item, [field]: nextValue } : item))
    }));
  };

  const addItem = () => {
    setValues((current) => ({
      ...current,
      items: [...current.items, createLineItem()]
    }));
  };

  const removeItem = (itemId: string) => {
    setValues((current) => ({
      ...current,
      items: current.items.length > 1 ? current.items.filter((item) => item.id !== itemId) : current.items
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!lockPatient && !values.patientTarget && !(values.createPatientInline && values.quickPatientName.trim())) {
      window.alert("Selecciona un paciente o carga un paciente nuevo rapido.");
      return;
    }

    if (!values.practitioner.trim()) {
      window.alert("Debes indicar el doctor tratante.");
      return;
    }

    const cleanItems = values.items.filter((item) => item.detail.trim());
    if (cleanItems.length === 0) {
      window.alert("Agrega al menos un tratamiento dentro de la atencion.");
      return;
    }

    if (values.scheduleFollowUp && !values.followUpDueDate) {
      window.alert("Indica la fecha del control o seguimiento.");
      return;
    }

    onSubmit({
      ...values,
      items: cleanItems
    });
  };

  return (
    <div className="modal-shell" role="presentation">
      <button type="button" className="modal-backdrop" aria-label="Cerrar modal" onClick={onClose} />

      <section className="modal-card attention-modal" role="dialog" aria-modal="true" aria-labelledby={modalId}>
        <header className="modal-card__header">
          <div>
            <p className="eyebrow">Atencion</p>
            <h2 id={modalId}>{title}</h2>
            {subtitle ? <p className="modal-card__subtitle">{subtitle}</p> : null}
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>
            Cerrar
          </button>
        </header>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-form__grid">
            {!lockPatient ? (
              <section className="surface-card surface-card--soft attention-panel modal-field--full">
                <div className="attention-panel__header">
                  <div>
                    <p className="eyebrow">Paciente</p>
                    <h3>Elegi una ficha o crea una nueva aca mismo</h3>
                  </div>
                  <button
                    type="button"
                    className={values.createPatientInline ? "primary-button attention-panel__toggle" : "ghost-button attention-panel__toggle"}
                    onClick={() =>
                      setValues((current) => ({
                        ...current,
                        createPatientInline: !current.createPatientInline,
                        patientTarget: current.createPatientInline ? current.patientTarget : ""
                      }))
                    }
                  >
                    {values.createPatientInline ? "Usar paciente ya cargado" : "Paciente nuevo rapido"}
                  </button>
                </div>

                <label className="modal-field">
                  <span>Buscar paciente existente</span>
                  <div className="modal-search">
                    <input
                      type="search"
                      value={patientDraft}
                      placeholder="Buscar por nombre o telefono"
                      onFocus={() => setShowPatientResults(true)}
                      onBlur={() => {
                        window.setTimeout(() => setShowPatientResults(false), 120);
                      }}
                      onChange={(event) => {
                        const nextDraft = event.target.value;
                        setPatientDraft(nextDraft);
                        const exact = patientOptions.find(
                          (option) => option.label.toLowerCase() === nextDraft.trim().toLowerCase()
                        );
                        setValues((current) => ({
                          ...current,
                          patientTarget: exact?.value ?? ""
                        }));
                        setShowPatientResults(true);
                      }}
                    />

                    {showPatientResults && filteredPatients.length > 0 ? (
                      <div className="modal-search__results">
                        {filteredPatients.slice(0, 8).map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className="modal-search__option"
                            onClick={() => {
                              setValues((current) => ({
                                ...current,
                                patientTarget: option.value,
                                createPatientInline: false
                              }));
                              setPatientDraft(option.label);
                              setShowPatientResults(false);
                            }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </label>

                {values.patientTarget ? (
                  <p className="attention-panel__state">Paciente listo: {patientDraft}</p>
                ) : (
                  <p className="attention-panel__hint">
                    Si el paciente no aparece, activa "Paciente nuevo rapido" y segui sin salir de esta pantalla.
                  </p>
                )}

                {values.createPatientInline ? (
                  <div className="attention-inline-grid">
                    <label className="modal-field">
                      <span>Nombre del paciente nuevo</span>
                      <input
                        type="text"
                        value={values.quickPatientName}
                        placeholder="Ej.: Juan Perez"
                        onChange={(event) =>
                          setValues((current) => ({
                            ...current,
                            quickPatientName: event.target.value,
                            patientTarget: ""
                          }))
                        }
                      />
                    </label>

                    <label className="modal-field">
                      <span>Telefono</span>
                      <input
                        type="tel"
                        value={values.quickPatientPhone}
                        placeholder="Opcional por ahora"
                        onChange={(event) =>
                          setValues((current) => ({
                            ...current,
                            quickPatientPhone: event.target.value
                          }))
                        }
                      />
                    </label>
                  </div>
                ) : null}
              </section>
            ) : null}

            <label className="modal-field">
              <span>Fecha</span>
              <input
                type="date"
                value={values.date}
                required
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    date: event.target.value
                  }))
                }
              />
            </label>

            <label className="modal-field">
              <span>Doctor tratante</span>
              <input
                type="text"
                value={values.practitioner}
                placeholder="Ej.: Dr. Luis F. Gonzalez"
                required
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    practitioner: event.target.value
                  }))
                }
              />
            </label>

            <label className="modal-field modal-field--full">
              <span>Observacion general</span>
              <textarea
                rows={4}
                value={values.note}
                placeholder="Nota general de esta atencion"
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    note: event.target.value
                  }))
                }
              />
            </label>
          </div>

          <section className="attention-items">
            <div className="attention-items__header">
              <div>
                <p className="eyebrow">Procedimientos</p>
                <h3>Tratamientos dentro de esta atencion</h3>
              </div>
              <button type="button" className="outline-button" onClick={addItem}>
                Agregar tratamiento
              </button>
            </div>

            <div className="attention-items__list">
              {values.items.map((item, index) => (
                <article key={item.id} className="attention-item-card">
                  <div className="attention-item-card__header">
                    <strong>Tratamiento {index + 1}</strong>
                    <button
                      type="button"
                      className="danger-button danger-button--ghost"
                      onClick={() => removeItem(item.id)}
                      disabled={values.items.length === 1}
                    >
                      Quitar
                    </button>
                  </div>

                  <div className="attention-item-card__grid">
                    <label className="modal-field">
                      <span>Categoria</span>
                      <select value={item.category} onChange={(event) => updateItem(item.id, "category", event.target.value)}>
                        {categories.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="modal-field attention-item-card__detail">
                      <span>Tratamiento realizado</span>
                      <input
                        type="text"
                        value={item.detail}
                        placeholder="Ej.: Obturacion MO pieza 16"
                        onChange={(event) => updateItem(item.id, "detail", event.target.value)}
                      />
                    </label>

                    <label className="modal-field">
                      <span>Monto del tratamiento</span>
                      <input
                        type="number"
                        min={0}
                        step="1"
                        value={item.totalAmount}
                        placeholder="0"
                        onChange={(event) => updateItem(item.id, "totalAmount", event.target.value)}
                      />
                    </label>

                    <label className="modal-field">
                      <span>Cuanto pago hoy</span>
                      <input
                        type="number"
                        min={0}
                        step="1"
                        value={item.paidAmount}
                        placeholder="0"
                        onChange={(event) => updateItem(item.id, "paidAmount", event.target.value)}
                      />
                    </label>

                    <label className="modal-field">
                      <span>Costo del caso</span>
                      <input
                        type="number"
                        min={0}
                        step="1"
                        value={item.costAmount}
                        placeholder="Opcional"
                        onChange={(event) => updateItem(item.id, "costAmount", event.target.value)}
                      />
                    </label>

                    <label className="modal-field">
                      <span>Tipo de costo</span>
                      <select value={item.costCategory} onChange={(event) => updateItem(item.id, "costCategory", event.target.value)}>
                        <option value="Laboratorio">Laboratorio</option>
                        <option value="Placa o protesis">Placa o protesis</option>
                        <option value="Material descartable">Material descartable</option>
                        <option value="Insumo clinico">Insumo clinico</option>
                        <option value="Honorario derivado">Honorario derivado</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </label>

                    <label className="modal-field">
                      <span>Estado</span>
                      <select value={item.status} onChange={(event) => updateItem(item.id, "status", event.target.value)}>
                        {statuses.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </article>
              ))}
            </div>

            <section className="surface-card surface-card--soft attention-panel attention-summary">
              <div className="attention-panel__header">
                <div>
                  <p className="eyebrow">Seguimiento</p>
                  <h3>Deja el control agendado ahora si hace falta</h3>
                </div>
                <button
                  type="button"
                  className={values.scheduleFollowUp ? "primary-button attention-panel__toggle" : "ghost-button attention-panel__toggle"}
                  onClick={() =>
                    setValues((current) => ({
                      ...current,
                      scheduleFollowUp: !current.scheduleFollowUp
                    }))
                  }
                >
                  {values.scheduleFollowUp ? "No programar control" : "Programar control"}
                </button>
              </div>

              {values.scheduleFollowUp ? (
                <div className="modal-form__grid attention-inline-grid">
                  <label className="modal-field">
                    <span>Fecha del control</span>
                    <input
                      type="date"
                      value={values.followUpDueDate}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          followUpDueDate: event.target.value
                        }))
                      }
                    />
                  </label>

                  <label className="modal-field">
                    <span>Tipo de seguimiento</span>
                    <select
                      value={values.followUpType}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          followUpType: event.target.value
                        }))
                      }
                    >
                      {followUpTypes.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="modal-field modal-field--full">
                    <span>Nota del control</span>
                    <textarea
                      rows={3}
                      value={values.followUpNotes}
                      placeholder="Ej.: revisar evolucion, retiro de puntos, llamar en 7 dias"
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          followUpNotes: event.target.value
                        }))
                      }
                    />
                  </label>
                </div>
              ) : (
                <p className="attention-panel__hint">
                  Si esta visita necesita control, retiro de puntos o reevaluacion, puedes dejarlo listo aqui mismo.
                </p>
              )}
            </section>

            <section className="surface-card surface-card--soft attention-summary">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Resumen de esta carga</p>
                  <h3>Ingreso y costo en una sola vista</h3>
                </div>
              </div>
              <div className="mini-metrics">
                <article className="mini-metric">
                  <span>Facturado</span>
                  <strong>Gs. {totals.billed.toLocaleString("es-PY")}</strong>
                </article>
                <article className="mini-metric">
                  <span>Cobrado hoy</span>
                  <strong>Gs. {totals.paid.toLocaleString("es-PY")}</strong>
                </article>
                <article className="mini-metric">
                  <span>Costos</span>
                  <strong>Gs. {totals.costs.toLocaleString("es-PY")}</strong>
                </article>
                <article className="mini-metric">
                  <span>Utilidad cobrada</span>
                  <strong>Gs. {(totals.paid - totals.costs).toLocaleString("es-PY")}</strong>
                </article>
              </div>
            </section>
          </section>

          <footer className="modal-card__footer">
            <button type="button" className="outline-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-button">
              {submitLabel}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
