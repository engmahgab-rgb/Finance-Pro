import { describe, expect, it } from 'vitest';
import type { Account, Transaction } from '../core/types';
import { accountBalanceFromLedger, creditAvailable, summarizeLedger } from './ledger-service';

const bank: Account = { id: 'bank', name: 'Bank', type: 'bank', openingBalance: 1000, color: '#1769e0', createdAt: '2026-01-01' };
const credit: Account = { id: 'credit', name: 'Credit', type: 'credit', openingBalance: 0, creditLimit: 5000, color: '#1769e0', createdAt: '2026-01-01' };
const tx = (overrides: Partial<Transaction>): Transaction => ({ id: crypto.randomUUID(), accountId: 'bank', kind: 'expense', amount: 1, date: '2026-01-01', tags: [], createdAt: '2026-01-01', ...overrides });

describe('financial ledger', () => {
  it('does not treat a bank-to-bank transfer as income or expense', () => {
    const savings: Account = { ...bank, id: 'savings', type: 'savings', name: 'Savings' };
    const transfer = tx({ kind: 'transfer', amount: 300, destinationAccountId: savings.id });
    expect(accountBalanceFromLedger(bank, [transfer])).toBe(700);
    expect(accountBalanceFromLedger(savings, [transfer])).toBe(1300);
    expect(summarizeLedger([bank, savings], [transfer]).cashFlow).toBe(0);
  });
  it('records a credit purchase as a liability and preserves available limit', () => {
    const purchase = tx({ accountId: credit.id, kind: 'credit_purchase', amount: 1200 });
    expect(accountBalanceFromLedger(credit, [purchase])).toBe(1200);
    expect(creditAvailable(credit, [purchase])).toBe(3800);
    expect(summarizeLedger([bank, credit], [purchase]).netWorth).toBe(-200);
  });
  it('reduces card liability after a bank-funded card payment without expense double counting', () => {
    const purchase = tx({ accountId: credit.id, kind: 'credit_purchase', amount: 1200 });
    const payment = tx({ kind: 'credit_payment', amount: 500, destinationAccountId: credit.id });
    expect(accountBalanceFromLedger(bank, [purchase, payment])).toBe(500);
    expect(accountBalanceFromLedger(credit, [purchase, payment])).toBe(700);
    expect(summarizeLedger([bank, credit], [purchase, payment]).expenses).toBe(1200);
  });
  it('counts income, expense, and refund correctly', () => {
    const transactions = [tx({ kind: 'income', amount: 4000 }), tx({ kind: 'expense', amount: 800 }), tx({ kind: 'refund', amount: 100 })];
    expect(summarizeLedger([bank], transactions)).toMatchObject({ income: 4100, expenses: 800, cashFlow: 3300 });
  });
  it('adds money to a bank or cash account as income', () => {
    const cash: Account = { ...bank, id: 'cash', type: 'cash', openingBalance: 0 };
    expect(accountBalanceFromLedger(bank, [tx({ kind: 'income', amount: 1000 })])).toBe(2000);
    expect(accountBalanceFromLedger(cash, [tx({ accountId: cash.id, kind: 'income', amount: 500 })])).toBe(500);
  });
  it('adjusts an account up or down without changing ordinary reports', () => {
    const up = tx({ kind: 'balance_adjustment_in', amount: 250 });
    const down = tx({ kind: 'balance_adjustment_out', amount: 200 });
    expect(accountBalanceFromLedger(bank, [up])).toBe(1250);
    expect(accountBalanceFromLedger(bank, [down])).toBe(800);
    expect(summarizeLedger([bank], [up, down])).toMatchObject({ income: 0, expenses: 0, cashFlow: 0, netWorth: 1050 });
  });
  it('does not change a balance when only account metadata is edited', () => {
    const renamedBank = { ...bank, name: 'Renamed bank', color: '#0000ff' };
    const transaction = tx({ kind: 'income', amount: 300 });
    expect(accountBalanceFromLedger(renamedBank, [transaction])).toBe(accountBalanceFromLedger(bank, [transaction]));
  });
});
