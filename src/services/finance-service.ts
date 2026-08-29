import { v4 as uuid } from 'uuid';
import { db } from '../database/db';
import type { Account, Budget, Category, Recurring, Transaction, TransactionKind } from '../core/types';

const today = () => new Date().toISOString().slice(0, 10);
/** Seeds a useful first-run workspace without overwriting user data. */
export async function seedDatabase(): Promise<void> {
  if (await db.accounts.count()) return;
  const account: Account = { id: uuid(), name: 'Main account', type: 'bank', openingBalance: 2400, color: '#126b4b', createdAt: today() };
  const categories: Category[] = [['Salary', '↗', '#16876a', 'income'], ['Food & dining', '◉', '#e68a38', 'expense'], ['Transport', '⌁', '#3c78d8', 'expense'], ['Subscriptions', '◌', '#8657c5', 'expense'], ['Shopping', '◇', '#de5a72', 'expense']].map(([name, icon, color, kind]) => ({ id: uuid(), name, icon, color, kind: kind as Category['kind'] }));
  await db.transaction('rw', db.accounts, db.categories, db.transactions, async () => { await db.accounts.add(account); await db.categories.bulkAdd(categories); await db.transactions.bulkAdd([{ id: uuid(), accountId: account.id, categoryId: categories[0].id, kind: 'income', amount: 3800, date: today(), note: 'Monthly salary', tags: [], createdAt: today() }, { id: uuid(), accountId: account.id, categoryId: categories[1].id, kind: 'expense', amount: 64.5, date: today(), note: 'Market', tags: [], createdAt: today() }]); });
}
/** Ensures cash and credit-card payment sources are available for recording purchases. */
export async function ensurePaymentAccounts(): Promise<void> {
  const accounts = await db.accounts.toArray();
  const additions: Account[] = [];
  if (!accounts.some(account => account.type === 'cash')) additions.push({ id: uuid(), name: 'Cash', type: 'cash', openingBalance: 0, color: '#d88935', createdAt: today() });
  if (!accounts.some(account => account.type === 'debit')) additions.push({ id: uuid(), name: 'Debit card', type: 'debit', openingBalance: 0, color: '#2674a8', createdAt: today() });
  if (!accounts.some(account => account.type === 'credit')) additions.push({ id: uuid(), name: 'Credit card', type: 'credit', openingBalance: 0, color: '#6657c5', createdAt: today() });
  if (additions.length) await db.accounts.bulkAdd(additions);
}
export async function createTransaction(input: Omit<Transaction, 'id' | 'createdAt'>): Promise<void> { await db.transactions.add({ ...input, id: uuid(), createdAt: new Date().toISOString() }); }
export async function updateTransaction(id: string, input: Omit<Transaction, 'id' | 'createdAt'>): Promise<void> { await db.transactions.update(id, input); }
/** Moves money between two accounts, for example cash to bank or bank to a credit-card payment. */
export async function transferMoney(sourceAccountId: string, destinationAccountId: string, amount: number, date: string, note: string): Promise<void> { await createTransaction({ accountId: sourceAccountId, destinationAccountId, kind: 'transfer', amount, date, note, tags: [] }); }
export async function createAccount(input: Omit<Account, 'id' | 'createdAt'>): Promise<void> { await db.accounts.add({ ...input, id: uuid(), createdAt: new Date().toISOString() }); }
export async function updateAccount(id: string, input: Omit<Account, 'id' | 'createdAt'>): Promise<void> { await db.accounts.update(id, input); }
export async function createRecurring(input: Omit<Recurring, 'id'>): Promise<void> { await db.recurring.add({ ...input, id: uuid() }); }
export async function updateRecurring(id: string, input: Omit<Recurring, 'id'>): Promise<void> { await db.recurring.update(id, input); }
export async function deleteRecurring(id: string): Promise<void> { await db.recurring.delete(id); }
export async function totalsForMonth(month: string): Promise<{ income: number; expenses: number }> { const txs = await db.transactions.where('date').between(`${month}-01`, `${month}-31`, true, true).toArray(); return txs.reduce((total, tx) => ({ income: total.income + (tx.kind === 'income' ? tx.amount : 0), expenses: total.expenses + (tx.kind === 'expense' ? tx.amount : 0) }), { income: 0, expenses: 0 }); }
export async function accountBalance(account: Account): Promise<number> { const txs = await db.transactions.toArray(); const direction = account.type === 'credit' ? -1 : 1; return txs.reduce((value, tx) => { if (tx.accountId === account.id) return value + (tx.kind === 'income' ? tx.amount * direction : -tx.amount * direction); if (tx.destinationAccountId === account.id) return value + tx.amount * direction; return value; }, account.openingBalance); }
export async function saveBudget(input: Omit<Budget, 'id'>): Promise<void> { await db.budgets.put({ ...input, id: uuid() }); }
export const transactionKinds: TransactionKind[] = ['expense', 'income', 'transfer'];
