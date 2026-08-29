import type { Recurring } from '../core/types';

export function nextRecurringDate(item: Recurring, from = item.nextDate): string {
  const date = new Date(`${from}T12:00:00`);
  if (item.cadence === 'weekly') date.setDate(date.getDate() + 7);
  if (item.cadence === 'monthly') date.setMonth(date.getMonth() + 1);
  if (item.cadence === 'yearly') date.setFullYear(date.getFullYear() + 1);
  const customMonths = /^months_(\d+)$/.exec(item.cadence);
  if (customMonths) date.setMonth(date.getMonth() + Number(customMonths[1]));
  return date.toISOString().slice(0, 10);
}

function monthIndex(date: string): number {
  const [year, month] = date.slice(0, 7).split('-').map(Number);
  return year * 12 + month - 1;
}

/** Calculates the monthly reserve saved before the due month. */
export function recurringReserveProgress(item: Recurring, asOf = new Date()): { monthsSaved: number; plannedMonths: number; amountSaved: number } | undefined {
  if (!item.monthlyReserve || item.monthlyReserve <= 0) return undefined;
  const cycleStart = item.reserveCycleStartDate ?? item.startDate ?? item.nextDate;
  const today = `${asOf.getFullYear()}-${String(asOf.getMonth() + 1).padStart(2, '0')}-01`;
  const plannedMonths = Math.max(0, monthIndex(item.nextDate) - monthIndex(cycleStart));
  const monthsSaved = Math.min(plannedMonths, Math.max(0, monthIndex(today) - monthIndex(cycleStart) + 1));
  return { monthsSaved, plannedMonths, amountSaved: monthsSaved * item.monthlyReserve };
}

export function applyRecurringPayment(item: Recurring, paidDate: string): Pick<Recurring, 'nextDate' | 'paidInstallments' | 'active' | 'reserveCycleStartDate'> {
  const paidInstallments = (item.paidInstallments ?? 0) + 1;
  const installmentComplete = Boolean(item.totalInstallments && paidInstallments >= item.totalInstallments);
  const nextDate = nextRecurringDate(item, paidDate);
  const pastEndDate = Boolean(item.endDate && nextDate > item.endDate);
  return { nextDate, paidInstallments, active: !installmentComplete && !pastEndDate, reserveCycleStartDate: paidDate };
}

export function skipRecurringOccurrence(item: Recurring): Pick<Recurring, 'nextDate' | 'skippedDates'> {
  return { nextDate: nextRecurringDate(item), skippedDates: [...(item.skippedDates ?? []), item.nextDate] };
}
