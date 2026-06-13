import { useEffect, useMemo } from "react";
import logoNuevo from "../../logonuevo.png";
import { formatDate, formatGs } from "../lib/date";
import type { BudgetEntry, Patient } from "../types/clinic";

interface BudgetPrintPreviewProps {
  patient: Patient;
  budget: BudgetEntry;
  onClose: () => void;
  onEdit: () => void;
}

const clinicData = {
  professionalName: "Dr. Luis F. Gonzalez V.",
  address: "Molas Lopez 2318",
  phone: "0981 885999",
  whatsapp: "0971 112719"
};

function buildPrintRows(budget: BudgetEntry) {
  const rows = [...budget.items];
  while (rows.length < 8) {
    rows.push({
      id: `blank-${rows.length}`,
      quantity: 0,
      detail: "",
      unitPrice: 0,
      totalPrice: 0
    });
  }
  return rows;
}

export function BudgetPrintPreview({
  patient,
  budget,
  onClose,
  onEdit
}: BudgetPrintPreviewProps) {
  const printRows = useMemo(() => buildPrintRows(budget), [budget]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="modal-shell budget-print-portal" role="presentation">
      <button type="button" className="modal-backdrop" aria-label="Cerrar vista de impresion" onClick={onClose} />

      <section className="budget-preview" role="dialog" aria-modal="true" aria-labelledby="budget-print-title">
        <header className="budget-preview__chrome">
          <div>
            <p className="eyebrow">Impresion</p>
            <h2 id="budget-print-title">Presupuesto listo para imprimir</h2>
            <p className="modal-card__subtitle">La ficha guarda solo los datos. Esta hoja se arma recien para vista previa y papel.</p>
          </div>

          <div className="budget-preview__actions">
            <button type="button" className="outline-button" onClick={onEdit}>
              Editar
            </button>
            <button type="button" className="outline-button" onClick={onClose}>
              Cerrar
            </button>
            <button type="button" className="primary-button" onClick={() => window.print()}>
              Imprimir
            </button>
          </div>
        </header>

        <article className="budget-sheet">
          <header className="budget-sheet__header">
            <div className="budget-sheet__brand">
              <img className="budget-sheet__logo" src={logoNuevo} alt="Dr. Luis F. Gonzalez V." />
              <div>
                <p className="budget-sheet__eyebrow">Odontologia integral</p>
                <h1>Presupuesto</h1>
              </div>
            </div>

            <div className="budget-sheet__clinic">
              <strong>{clinicData.professionalName}</strong>
              <span>{clinicData.address}</span>
              <span>Telefono: {clinicData.phone}</span>
              <span>WhatsApp: {clinicData.whatsapp}</span>
            </div>
          </header>

          <section className="budget-sheet__meta">
            <div className="budget-sheet__meta-card">
              <span>Numero</span>
              <strong>{budget.budgetNumber}</strong>
            </div>
            <div className="budget-sheet__meta-card">
              <span>Fecha</span>
              <strong>{formatDate(budget.createdAt)}</strong>
            </div>
            <div className="budget-sheet__meta-card">
              <span>Valido hasta</span>
              <strong>{formatDate(budget.validUntil)}</strong>
            </div>
            <div className="budget-sheet__meta-card">
              <span>Destinatario</span>
              <strong>{patient.fullName}</strong>
              <small>{patient.phone || "Sin telefono"}</small>
            </div>
          </section>

          <section className="budget-sheet__table">
            <div className="budget-sheet__table-head">
              <span>Cantidad</span>
              <span>Detalle del tratamiento</span>
              <span>Precio unitario</span>
              <span>Total</span>
            </div>

            <div className="budget-sheet__table-body">
              {printRows.map((item) => (
                <div key={item.id} className={`budget-sheet__row ${item.detail ? "has-content" : ""}`}>
                  <span>{item.detail ? item.quantity : ""}</span>
                  <span>{item.detail}</span>
                  <span>{item.detail ? formatGs(item.unitPrice) : ""}</span>
                  <strong>{item.detail ? formatGs(item.totalPrice) : ""}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="budget-sheet__footer">
            <div className="budget-sheet__notes">
              <span>Observacion</span>
              <p>{budget.note || "Presupuesto sujeto a reevaluacion clinica segun evolucion del caso."}</p>
            </div>

            <div className="budget-sheet__totals">
              <div>
                <span>Validez</span>
                <strong>{budget.validityDays} dias</strong>
              </div>
              <div className="is-grand">
                <span>Total presupuestado</span>
                <strong>{formatGs(budget.totalAmount)}</strong>
              </div>
            </div>
          </section>
        </article>
      </section>
    </div>
  );
}
