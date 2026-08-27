export type TransactionKind = 'income' | 'expense' | 'transfer';
export interface Account { id: string; name: string; type: 'cash' | 'bank' | 'wallet' | 'savings' | 'debit' | 'credit'; openingBalance: number; color: string; createdAt: string; }
export interface Category { id: string; name: string; icon: string; color: string; kind: 'income' | 'expense'; }
export interface Transaction { id: string; accountId: string; destinationAccountId?: string; categoryId?: string; kind: TransactionKind; amount: number; date: string; note?: string; tags: string[]; createdAt: string; }
export interface Budget { id: string; categoryId: string; month: string; limit: number; }
export interface Recurring { id: string; name: string; accountId: string; categoryId?: string; kind: TransactionKind; amount: number; cadence: 'weekly' | 'monthly' | 'yearly'; nextDate: string; active: boolean; }
export interface AppSettings { id: 'app'; currency: string; darkMode: boolean; }
