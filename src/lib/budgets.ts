import { addDays, formatDate } from "./date";
import type { BudgetEntry, BudgetItem } from "../types/clinic";

function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function createBudgetItem(id: string, quantity = 1, detail = "", unitPrice = 0): BudgetItem {
  const safeQuantity = Math.max(quantity, 0);
  const safeUnitPrice = Math.max(unitPrice, 0);

  return {
    id,
    quantity: safeQuantity,
    detail,
    unitPrice: safeUnitPrice,
    totalPrice: safeQuantity * safeUnitPrice
  };
}

export function syncBudgetItem(item: BudgetItem): BudgetItem {
  return createBudgetItem(item.id, Number(item.quantity || 0), String(item.detail || ""), Number(item.unitPrice || 0));
}

export function getBudgetTotalAmount(items: BudgetItem[]): number {
  return items.reduce((sum, item) => sum + syncBudgetItem(item).totalPrice, 0);
}

export function buildBudgetValidUntil(createdAt: string, validityDays: 15 | 30): string {
  const baseDate = parseIsoDate(createdAt);
  return addDays(baseDate, validityDays);
}

export function createBudgetNumber(createdAt: string, seed: string): string {
  const compactDate = createdAt.replace(/-/g, "");
  const compactSeed = seed.replace(/[^a-z0-9]/gi, "").slice(-4).toUpperCase() || "0001";
  return `P-${compactDate}-${compactSeed}`;
}

export function syncBudgetEntry(entry: BudgetEntry): BudgetEntry {
  const normalizedItems = entry.items.map((item) => syncBudgetItem(item)).filter((item) => item.detail.trim());
  const validityDays = entry.validityDays === 30 ? 30 : 15;
  const createdAt = entry.createdAt || new Date().toISOString().slice(0, 10);

  return {
    ...entry,
    createdAt,
    validityDays,
    validUntil: entry.validUntil || buildBudgetValidUntil(createdAt, validityDays),
    items: normalizedItems,
    totalAmount: getBudgetTotalAmount(normalizedItems)
  };
}

export function sortBudgetsByDateDesc(items: BudgetEntry[]): BudgetEntry[] {
  return [...items].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function getBudgetSummary(entry: BudgetEntry): string {
  const [firstItem] = entry.items;
  if (!firstItem) return "Sin detalle";
  if (entry.items.length === 1) return firstItem.detail;
  return `${firstItem.detail} y ${entry.items.length - 1} item(s) mas`;
}

export function getBudgetStatusLabel(entry: BudgetEntry): string {
  const today = new Date().toISOString().slice(0, 10);
  return entry.validUntil >= today ? "Vigente" : "Vencido";
}

export function getBudgetMetaLabel(entry: BudgetEntry): string {
  return `Emitido ${formatDate(entry.createdAt)} · valido hasta ${formatDate(entry.validUntil)}`;
}
