import Dexie, { type Table } from 'dexie';
import type { Account, AppSettings, Budget, Category, Debt, DebtPayment, LocalBackup, Recurring, SyncMetadata, Transaction } from '../core/types';

/** Persistent local data store. UUIDs are supplied by the application, never auto-incremented. */
export class FinanceDatabase extends Dexie {
  accounts!: Table<Account, string>; transactions!: Table<Transaction, string>; categories!: Table<Category, string>;
  budgets!: Table<Budget, string>; recurring!: Table<Recurring, string>; goals!: Table<Record<string, unknown>, string>;
  plannedTransactions!: Table<Record<string, unknown>, string>; settings!: Table<AppSettings, string>;
  notifications!: Table<Record<string, unknown>, string>; attachments!: Table<Record<string, unknown>, string>; debts!: Table<Debt, string>; debtPayments!: Table<DebtPayment, string>; localBackups!: Table<LocalBackup, string>; syncMetadata!: Table<SyncMetadata, string>;
  public constructor() { super('finance-pro'); this.version(1).stores({ accounts: 'id,type', transactions: 'id,accountId,categoryId,kind,date', categories: 'id,kind', budgets: 'id,categoryId,month', recurring: 'id,nextDate,active', goals: 'id', plannedTransactions: 'id,date', settings: 'id', notifications: 'id', attachments: 'id,transactionId' }); this.version(2).stores({ accounts: 'id,type,archived', transactions: 'id,accountId,destinationAccountId,categoryId,kind,date,status,recurringId,debtId', categories: 'id,kind', budgets: 'id,categoryId,month', recurring: 'id,nextDate,active,accountId', goals: 'id', plannedTransactions: 'id,date', settings: 'id', notifications: 'id', attachments: 'id,transactionId', debts: 'id,direction,status,accountId,dueDate', debtPayments: 'id,debtId,accountId,date', localBackups: 'id,createdAt', syncMetadata: 'id' }).upgrade(async tx => { await tx.table('transactions').toCollection().modify(transaction => { transaction.status ??= 'posted'; transaction.updatedAt ??= transaction.createdAt; }); await tx.table('settings').update('app', { currency: 'SAR', language: 'en', appearance: 'system' }); }); }
}
export const db = new FinanceDatabase();
