import { v4 as uuid } from 'uuid';
import { db } from '../database/db';
import type { Account, Budget, Category, Recurring, Transaction, TransactionKind } from '../core/types';
import { accountBalanceFromLedger } from './ledger-service';

/** Adds reusable categories only. Financial accounts and transactions are always user-created. */
export async function seedDatabase(): Promise<void> {
  if (await db.categories.count()) return;
  const categories: Category[] = [['Salary', '↗', '#16876a', 'income'], ['Bonus', '✦', '#2674a8', 'income'], ['Other income', '＋', '#6657c5', 'income'], ['Groceries', '◉', '#e68a38', 'expense'], ['Restaurants', '◌', '#d96554', 'expense'], ['Fuel & car', '⌁', '#3c78d8', 'expense'], ['Housing', '⌂', '#7d6bc9', 'expense'], ['Utilities', '⌁', '#3c78d8', 'expense'], ['Family', '♥', '#de5a72', 'expense'], ['Healthcare', '✚', '#16876a', 'expense'], ['Travel', '✈', '#2674a8', 'expense'], ['Education', '◫', '#6657c5', 'expense'], ['Shopping', '◇', '#de5a72', 'expense'], ['Subscriptions', '↻', '#8657c5', 'expense'], ['Charity', '♡', '#16876a', 'expense'], ['Entertainment', '★', '#e68a38', 'expense']].map(([name, icon, color, kind]) => ({ id: uuid(), name, icon, color, kind: kind as Category['kind'] }));
  await db.categories.bulkAdd(categories);
}
/**
 * Payment accounts are personal financial records and must never be invented by
 * the application. Users create their own cash, bank, debit, and credit sources.
 */
export async function ensurePaymentAccounts(): Promise<void> {
  return;
}
export async function createTransaction(input: Omit<Transaction, 'id' | 'createdAt'>): Promise<void> { await db.transactions.add({ ...input, id: uuid(), createdAt: new Date().toISOString() }); }
export async function addMoney(accountId: string, amount: number, date: string, reason: string, note: string): Promise<void> { const account = await db.accounts.get(accountId); if (!account || account.type === 'credit' || !Number.isFinite(amount) || amount <= 0 || !date) throw new Error('Enter a valid non-credit account, amount, and date.'); const kind: TransactionKind = reason === 'Refund' ? 'refund' : 'income'; await createTransaction({ accountId, kind, amount, date, note: note.trim() || reason, tags: [reason.toLowerCase().replaceAll(' ', '-')] }); }
export async function adjustAccountBalance(accountId: string, actualBalance: number, date: string, note: string): Promise<number> { const account = await db.accounts.get(accountId); if (!account || !Number.isFinite(actualBalance) || !date) throw new Error('Enter a valid account, balance, and date.'); const currentBalance = accountBalanceFromLedger(account, await db.transactions.toArray()); const difference = actualBalance - currentBalance; if (difference === 0) return 0; await createTransaction({ accountId, kind: difference > 0 ? 'balance_adjustment_in' : 'balance_adjustment_out', amount: Math.abs(difference), date, note: note.trim() || 'Balance adjustment', tags: ['balance-adjustment'] }); return difference; }
export async function updateTransaction(id: string, input: Omit<Transaction, 'id' | 'createdAt'>): Promise<void> { await db.transactions.update(id, input); }
/** Moves money between two accounts, for example cash to bank or bank to a credit-card payment. */
export async function transferMoney(sourceAccountId: string, destinationAccountId: string, amount: number, date: string, note: string): Promise<void> { await createTransaction({ accountId: sourceAccountId, destinationAccountId, kind: 'transfer', amount, date, note, tags: [] }); }
export async function createAccount(input: Omit<Account, 'id' | 'createdAt'>): Promise<void> { await db.accounts.add({ ...input, id: uuid(), createdAt: new Date().toISOString() }); }
export async function updateAccount(id: string, input: Omit<Account, 'id' | 'createdAt'>): Promise<void> { await db.accounts.update(id, input); }
export async function createRecurring(input: Omit<Recurring, 'id'>): Promise<void> { await db.recurring.add({ ...input, id: uuid() }); }
export async function updateRecurring(id: string, input: Omit<Recurring, 'id'>): Promise<void> { await db.recurring.update(id, input); }
export async function deleteRecurring(id: string): Promise<void> { await db.recurring.delete(id); }
export async function totalsForMonth(month: string): Promise<{ income: number; expenses: number }> { const txs = await db.transactions.where('date').between(`${month}-01`, `${month}-31`, true, true).toArray(); return txs.reduce((total, tx) => ({ income: total.income + (tx.kind === 'income' ? tx.amount : 0), expenses: total.expenses + (tx.kind === 'expense' ? tx.amount : 0) }), { income: 0, expenses: 0 }); }
export async function accountBalance(account: Account): Promise<number> { return accountBalanceFromLedger(account, await db.transactions.toArray()); }
export async function saveBudget(input: Omit<Budget, 'id'>): Promise<void> { await db.budgets.put({ ...input, id: uuid() }); }
export const transactionKinds: TransactionKind[] = ['expense', 'income', 'transfer', 'credit_purchase', 'credit_payment', 'refund', 'loan_given', 'loan_received', 'loan_repayment', 'balance_adjustment_in', 'balance_adjustment_out'];
