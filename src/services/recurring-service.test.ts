import { describe, expect, it } from 'vitest';
import type { Recurring } from '../core/types';
import { applyRecurringPayment, nextRecurringDate, recurringReserveProgress, skipRecurringOccurrence } from './recurring-service';

const recurring: Recurring = { id: 'rent', name: 'Rent', kind: 'expense', amount: 2000, cadence: 'monthly', nextDate: '2026-01-31', startDate: '2026-01-31', totalInstallments: 3, paidInstallments: 0, active: true };

describe('recurring schedule', () => {
  it('advances a monthly payment date', () => expect(nextRecurringDate(recurring)).toBe('2026-03-03'));
  it('advances a custom six-month payment date', () => expect(nextRecurringDate({ ...recurring, cadence: 'months_6', nextDate: '2026-01-15' })).toBe('2026-07-15'));
  it('tracks installments and marks the final payment inactive', () => expect(applyRecurringPayment({ ...recurring, paidInstallments: 2 }, '2026-03-31')).toMatchObject({ paidInstallments: 3, active: false }));
  it('records skipped occurrences', () => expect(skipRecurringOccurrence(recurring)).toMatchObject({ skippedDates: ['2026-01-31'] }));
  it('shows three reserve months in August for rent due in December', () => expect(recurringReserveProgress({ ...recurring, nextDate: '2026-12-01', startDate: '2026-06-01', reserveCycleStartDate: '2026-06-01', monthlyReserve: 1000 }, new Date('2026-08-20T12:00:00'))).toEqual({ monthsSaved: 3, plannedMonths: 6, amountSaved: 3000 }));
});
