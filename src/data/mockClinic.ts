import { addDays, addMonths, toIsoDate } from "../lib/date";
import { createFinanceEntry, createPaymentEntry } from "../lib/financeEntries";
import type { Expense, Patient } from "../types/clinic";

const today = new Date();

function treatment(
  id: string,
  offset: number,
  category: string,
  detail: string,
  practitioner: string,
  totalAmount: number,
  paidAmount: number,
  status: "Realizado" | "Planificado" | "Control pendiente" | "Cancelado",
  note = "",
  linkedFinanceId?: string
) {
  return {
    id,
    date: addDays(today, offset),
    category,
    detail,
    practitioner,
    status,
    totalAmount,
    paidAmount,
    pendingAmount: Math.max(totalAmount - paidAmount, 0),
    note,
    linkedFinanceId
  };
}

function evolution(
  id: string,
  offset: number,
  reason: string,
  findings: string,
  diagnosis: string,
  procedure: string,
  indications: string,
  nextStep: string
) {
  return {
    id,
    date: addDays(today, offset),
    reason,
    findings,
    diagnosis,
    procedure,
    indications,
    nextStep
  };
}

function followUp(
  id: string,
  eventOffset: number,
  dueOffset: number,
  type: string,
  source: string,
  status: "Pendiente" | "Realizado" | "Reprogramado" | "Cancelado",
  notes = ""
) {
  return {
    id,
    eventDate: addDays(today, eventOffset),
    dueDate: addDays(today, dueOffset),
    type,
    source,
    status,
    notes
  };
}

function note(id: string, offset: number, text: string) {
  return {
    id,
    date: addDays(today, offset),
    text
  };
}

function finance(
  id: string,
  offset: number,
  concept: string,
  totalAmount: number,
  paidAmount: number,
  description: string,
  practitioner?: string,
  linkedTreatmentId?: string
) {
  return createFinanceEntry({
    id,
    date: addDays(today, offset),
    concept,
    practitioner,
    totalAmount,
    description,
    linkedTreatmentId,
    payments:
      paidAmount > 0
        ? [
            createPaymentEntry({
              id: `${id}-payment-1`,
              date: addDays(today, offset),
              amount: paidAmount,
              method: "Importado",
              note: description
            })
          ]
        : []
  });
}

function patientExpense(
  id: string,
  offset: number,
  concept: string,
  category: string,
  amount: number,
  description: string
) {
  return {
    id,
    date: addDays(today, offset),
    concept,
    category,
    amount,
    description,
    scope: "patient" as const
  };
}

export const mockPatients: Patient[] = [
  {
    id: "p-ana-benitez",
    fullName: "Ana Maria Benitez",
    phone: "+595981223344",
    createdAt: addMonths(today, -14),
    birthDate: "1988-07-02",
    lastVisit: addDays(today, -2),
    financeTone: "partial",
    occupation: "Arquitecta",
    city: "Asuncion",
    tags: ["Periodoncia", "Postquirurgico", "WhatsApp activo"],
    clinicalSummary:
      "Paciente con tratamiento periodontal en fase de mantenimiento, buena adherencia al control y necesidad de reevaluacion de sangrado.",
    treatments: [
      treatment(
        "t-ana-1",
        -12,
        "Periodoncia",
        "Raspaje y alisado por cuadrante",
        "Dr. Luis F. Gonzalez",
        450000,
        450000,
        "Realizado",
        "Buena respuesta tisular.",
        "m-ana-1"
      ),
      treatment(
        "t-ana-2",
        -2,
        "Control",
        "Control postquirurgico y refuerzo de higiene",
        "Dr. Luis F. Gonzalez",
        180000,
        90000,
        "Control pendiente",
        "Control de retiro de puntos en curso.",
        "m-ana-2"
      )
    ],
    evolutions: [
      evolution(
        "e-ana-1",
        -2,
        "Control postoperatorio",
        "Encia con leve inflamacion residual, sin supuracion.",
        "Cicatrizacion favorable",
        "Evaluacion clinica y limpieza suave",
        "Continuar clorhexidina por 5 dias",
        "Retiro de puntos manana"
      )
    ],
    followUps: [
      followUp("f-ana-1", -2, -1, "Retiro de puntos", "Cirugia periodontal", "Pendiente", "Confirmar por WhatsApp"),
      followUp("f-ana-2", -12, 90, "Reevaluacion periodontal", "Raspaje y alisado", "Pendiente", "Control de 3 meses")
    ],
    notes: [
      note("n-ana-1", -7, "Prefiere turnos de manana y responde rapido por WhatsApp."),
      note("n-ana-2", -2, "Se mostro tranquila y motivada con la evolucion.")
    ],
    budgets: [],
    finances: [
      finance("m-ana-1", -12, "Raspaje y alisado", 450000, 450000, "Cobrado en el dia", "Dr. Luis F. Gonzalez", "t-ana-1"),
      finance(
        "m-ana-2",
        -2,
        "Control postquirurgico",
        180000,
        90000,
        "Saldo pendiente para proximo control",
        "Dr. Luis F. Gonzalez",
        "t-ana-2"
      )
    ],
    patientExpenses: [
      patientExpense("pe-ana-1", -12, "Anestesia y curetas", "Insumo clinico", 90000, "Material usado en el procedimiento periodontal")
    ]
  },
  {
    id: "p-carlos-ferreira",
    fullName: "Carlos Ferreira",
    phone: "+595985114488",
    createdAt: addMonths(today, -6),
    birthDate: "1979-11-18",
    lastVisit: addDays(today, -5),
    financeTone: "pending",
    occupation: "Contador",
    city: "Lambare",
    tags: ["Implantes", "Revision financiera"],
    clinicalSummary:
      "Caso en fase de rehabilitacion con implante unitario. Requiere seguimiento cercano del pago pendiente y control de osteointegracion.",
    treatments: [
      treatment(
        "t-carlos-1",
        -18,
        "Implantes",
        "Colocacion de implante en pieza 14",
        "Dr. Luis F. Gonzalez",
        4200000,
        2500000,
        "Realizado",
        "Sin incidentes.",
        "m-carlos-1"
      ),
      treatment(
        "t-carlos-2",
        -5,
        "Control",
        "Revision de cicatrizacion y estabilidad",
        "Dr. Luis F. Gonzalez",
        0,
        0,
        "Realizado",
        "Pendiente segunda etapa.",
        "m-carlos-2"
      )
    ],
    evolutions: [
      evolution(
        "e-carlos-1",
        -5,
        "Control de implante",
        "Zona estable, sin dolor espontaneo.",
        "Osteointegracion en curso",
        "Inspeccion clinica",
        "Evitar carga en el sector",
        "Control en 7 dias"
      )
    ],
    followUps: [
      followUp("f-carlos-1", -5, 0, "Control postquirurgico", "Implante pieza 14", "Pendiente", "Llamar si no confirma"),
      followUp("f-carlos-2", -18, 25, "Control general", "Implante en curso", "Pendiente", "Coordinar radiografia de control")
    ],
    notes: [note("n-carlos-1", -5, "Solicito recordatorio 24 horas antes de la cita.")],
    budgets: [],
    finances: [
      finance("m-carlos-1", -18, "Implante unitario", 4200000, 2500000, "Abono la sena inicial", "Dr. Luis F. Gonzalez", "t-carlos-1"),
      finance("m-carlos-2", -5, "Control de evolucion", 0, 0, "Incluido dentro del plan", "Dr. Luis F. Gonzalez", "t-carlos-2")
    ],
    patientExpenses: [
      patientExpense("pe-carlos-1", -17, "Tornillo de cicatrizacion", "Insumo clinico", 380000, "Costo del implante y componentes"),
      patientExpense("pe-carlos-2", -4, "Laboratorio provisorio", "Laboratorio", 450000, "Trabajo externo para la rehabilitacion")
    ]
  },
  {
    id: "p-paula-ayala",
    fullName: "Paula Ayala",
    phone: "+595972884411",
    createdAt: addMonths(today, -2),
    birthDate: "1994-01-25",
    lastVisit: addDays(today, -1),
    financeTone: "balanced",
    occupation: "Docente",
    city: "Fernando de la Mora",
    tags: ["Operatoria", "Control semestral"],
    clinicalSummary:
      "Paciente de operatoria y estetica con buena asistencia. Actualmente sin deuda y con control preventivo programado.",
    treatments: [
      treatment(
        "t-paula-1",
        -20,
        "Operatoria",
        "Restauracion estetica en incisivo central",
        "Dr. Luis F. Gonzalez",
        650000,
        650000,
        "Realizado",
        "Excelente adaptacion cromatica.",
        "m-paula-1"
      ),
      treatment(
        "t-paula-2",
        -1,
        "Consulta",
        "Control de sensibilidad y chequeo general",
        "Dr. Luis F. Gonzalez",
        120000,
        120000,
        "Realizado",
        "Sin molestias.",
        "m-paula-2"
      )
    ],
    evolutions: [
      evolution(
        "e-paula-1",
        -1,
        "Control de sensibilidad",
        "Sin dolor a la percusion, sensibilidad resuelta.",
        "Evolucion favorable",
        "Evaluacion clinica",
        "Mantener higiene y uso de pasta desensibilizante si reaparece",
        "Control preventivo en 6 meses"
      )
    ],
    followUps: [
      followUp("f-paula-1", -1, 7, "Control general", "Revision tras restauracion", "Pendiente", "Confirmar disponibilidad en la tarde"),
      followUp("f-paula-2", -20, 180, "Mantenimiento periodontal 6 meses", "Control preventivo", "Pendiente", "Recordatorio automatico")
    ],
    notes: [note("n-paula-1", -1, "Muy puntual. Prefiere comunicacion breve y clara.")],
    budgets: [],
    finances: [
      finance("m-paula-1", -20, "Restauracion estetica", 650000, 650000, "Cobro completo por transferencia", "Dr. Luis F. Gonzalez", "t-paula-1"),
      finance("m-paula-2", -1, "Consulta de control", 120000, 120000, "Pago con tarjeta", "Dr. Luis F. Gonzalez", "t-paula-2")
    ],
    patientExpenses: []
  },
  {
    id: "p-rodrigo-soto",
    fullName: "Rodrigo Soto",
    phone: "+595983664422",
    createdAt: addMonths(today, -10),
    birthDate: "1985-03-14",
    lastVisit: addDays(today, -28),
    financeTone: "review",
    occupation: "Ingeniero",
    city: "San Lorenzo",
    tags: ["Endodoncia", "Aplazado"],
    clinicalSummary:
      "Paciente con endodoncia iniciada y tratamiento pausado. Hay que retomar agenda y definir continuidad del plan.",
    treatments: [
      treatment(
        "t-rodrigo-1",
        -32,
        "Endodoncia",
        "Apertura cameral y medicacion intraconducto",
        "Dr. Marta Acosta",
        900000,
        300000,
        "Planificado",
        "Falta segunda sesion.",
        "m-rodrigo-1"
      ),
      treatment(
        "t-rodrigo-2",
        -28,
        "Control",
        "Reevaluacion por dolor ocasional",
        "Dr. Luis F. Gonzalez",
        0,
        0,
        "Cancelado",
        "Reprogramar con anticipacion."
      )
    ],
    evolutions: [
      evolution(
        "e-rodrigo-1",
        -28,
        "Molestia intermitente",
        "Sin edema, dolor leve a la presion.",
        "Pulpa en tratamiento",
        "Evaluacion y medicacion",
        "Analgesia si reaparece dolor",
        "Coordinar segunda sesion"
      )
    ],
    followUps: [
      followUp("f-rodrigo-1", -28, 6, "Control general", "Endodoncia pieza 26", "Reprogramado", "Paciente pidio mover el turno"),
      followUp("f-rodrigo-2", -32, 22, "Control general", "Reinicio de plan", "Pendiente", "Llamar para confirmar continuidad")
    ],
    notes: [note("n-rodrigo-1", -12, "Le cuesta cerrar horario. Conviene ofrecer dos opciones concretas.")],
    budgets: [],
    finances: [
      finance("m-rodrigo-1", -32, "Inicio de endodoncia", 900000, 300000, "Saldo a revisar segun continuidad", "Dr. Marta Acosta", "t-rodrigo-1")
    ],
    patientExpenses: [
      patientExpense("pe-rodrigo-1", -31, "Lima rotatoria y sellador", "Insumo clinico", 145000, "Material especifico para la endodoncia")
    ]
  }
];

export const mockExpenses: Expense[] = [
  {
    id: "g-1",
    date: addDays(today, -8),
    concept: "Suturas y anestesicos",
    category: "Material odontologico",
    amount: 320000,
    description: "Reposicion de insumos para cirugias"
  },
  {
    id: "g-2",
    date: addDays(today, -4),
    concept: "Laboratorio protesis",
    category: "Laboratorio",
    amount: 780000,
    description: "Trabajo externo de coronas provisionales"
  },
  {
    id: "g-3",
    date: addDays(today, -1),
    concept: "Publicidad Instagram",
    category: "Marketing",
    amount: 180000,
    description: "Campana local del mes"
  }
];

export const mockSnapshot = {
  lastSyncLabel: toIsoDate(today),
  patients: mockPatients,
  expenses: mockExpenses
};
