import { CLINIC_TIMEZONE, dayjs } from "./dayjs";

const ISO_DATE_FORMAT = "YYYY-MM-DD";
const ISO_MONTH_FORMAT = "YYYY-MM";
const currencyFormatter = new Intl.NumberFormat("es-PY");
const shortDateFormatter = new Intl.DateTimeFormat("es-PY", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});
const monthLabelFormatter = new Intl.DateTimeFormat("es-PY", {
  month: "long",
  year: "numeric"
});
const shortMonthFormatter = new Intl.DateTimeFormat("es-PY", {
  month: "short"
});
const shortMonthYearFormatter = new Intl.DateTimeFormat("es-PY", {
  month: "short",
  year: "numeric"
});

export interface MonthRange {
  startMonth: string;
  endMonth: string;
}

function parseLocalDate(value: string): Date {
  return dayjs(value, ISO_DATE_FORMAT, true).toDate();
}

export function toIsoDate(value: Date): string {
  return dayjs(value).format(ISO_DATE_FORMAT);
}

export function todayIsoDate(referenceDate = new Date()): string {
  return dayjs(referenceDate).tz(CLINIC_TIMEZONE).format(ISO_DATE_FORMAT);
}

export function addDays(baseDate: Date | string, amount: number): string {
  return dayjs(baseDate).add(amount, "day").format(ISO_DATE_FORMAT);
}

export function addMonths(baseDate: Date | string, amount: number): string {
  return dayjs(baseDate).add(amount, "month").format(ISO_DATE_FORMAT);
}

export function formatDate(value: string | null): string {
  if (!value) return "Sin registro";
  return shortDateFormatter.format(parseLocalDate(value));
}

export function formatGs(amount: number): string {
  return `Gs. ${currencyFormatter.format(Math.round(amount || 0))}`;
}

export function getMonthKey(value: Date): string {
  return dayjs(value).tz(CLINIC_TIMEZONE).format(ISO_MONTH_FORMAT);
}

function monthKeyToDate(monthKey: string): Date {
  return dayjs(`${monthKey}-01`, ISO_DATE_FORMAT, true).toDate();
}

function compareMonthKeys(left: string, right: string): number {
  return left.localeCompare(right);
}

export function isSameMonth(isoDate: string, monthKey: string): boolean {
  return isoDate.slice(0, 7) === monthKey;
}

export function shiftMonthKey(monthKey: string, amount: number): string {
  return dayjs(`${monthKey}-01`, ISO_DATE_FORMAT, true).add(amount, "month").format(ISO_MONTH_FORMAT);
}

export function normalizeMonthRange(startMonth: string, endMonth: string): MonthRange {
  return compareMonthKeys(startMonth, endMonth) <= 0
    ? { startMonth, endMonth }
    : { startMonth: endMonth, endMonth: startMonth };
}

export function isDateWithinMonthRange(isoDate: string, range: MonthRange): boolean {
  const targetMonth = isoDate.slice(0, 7);
  return compareMonthKeys(targetMonth, range.startMonth) >= 0 && compareMonthKeys(targetMonth, range.endMonth) <= 0;
}

export function getDaysDiff(isoDate: string, now = new Date()): number {
  const target = dayjs.tz(isoDate, ISO_DATE_FORMAT, CLINIC_TIMEZONE).startOf("day");
  const today = dayjs(now).tz(CLINIC_TIMEZONE).startOf("day");
  return target.diff(today, "day");
}

export function formatMonthLabel(monthKey: string): string {
  return monthLabelFormatter.format(monthKeyToDate(monthKey));
}

export function formatMonthRangeLabel(range: MonthRange): string {
  if (range.startMonth === range.endMonth) {
    return formatMonthLabel(range.startMonth);
  }

  const startDate = monthKeyToDate(range.startMonth);
  const endDate = monthKeyToDate(range.endMonth);
  const sameYear = range.startMonth.slice(0, 4) === range.endMonth.slice(0, 4);

  if (sameYear) {
    return `${shortMonthFormatter.format(startDate)} - ${monthLabelFormatter.format(endDate)}`;
  }

  return `${shortMonthYearFormatter.format(startDate)} - ${shortMonthYearFormatter.format(endDate)}`;
}

export function buildWhatsAppLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}
