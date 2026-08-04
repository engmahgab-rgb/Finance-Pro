import Dexie, { type Table } from 'dexie';
import type { Account, AppSettings, Budget, Category, Recurring, Transaction } from '../core/types';

/** Persistent local data store. UUIDs are supplied by the application, never auto-incremented. */
export class FinanceDatabase extends Dexie {
  accounts!: Table<Account, string>; transactions!: Table<Transaction, string>; categories!: Table<Category, string>;
  budgets!: Table<Budget, string>; recurring!: Table<Recurring, string>; goals!: Table<Record<string, unknown>, string>;
  plannedTransactions!: Table<Record<string, unknown>, string>; settings!: Table<AppSettings, string>;
  notifications!: Table<Record<string, unknown>, string>; attachments!: Table<Record<string, unknown>, string>;
  public constructor() { super('finance-pro'); this.version(1).stores({ accounts: 'id,type', transactions: 'id,accountId,categoryId,kind,date', categories: 'id,kind', budgets: 'id,categoryId,month', recurring: 'id,nextDate,active', goals: 'id', plannedTransactions: 'id,date', settings: 'id', notifications: 'id', attachments: 'id,transactionId' }); }
}
export const db = new FinanceDatabase();
