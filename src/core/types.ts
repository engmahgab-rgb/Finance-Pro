export type AccountType = 'cash' | 'bank' | 'wallet' | 'savings' | 'debit' | 'credit';
export type TransactionKind = 'income' | 'expense' | 'transfer' | 'credit_purchase' | 'credit_payment' | 'refund' | 'loan_given' | 'loan_received' | 'loan_repayment' | 'balance_adjustment_in' | 'balance_adjustment_out';
export type TransactionStatus = 'posted' | 'void';
export type TranslationMap = Partial<Record<'en' | 'ar', string>>;
export interface Account { id: string; name: string; translations?: TranslationMap; type: AccountType; openingBalance: number; creditLimit?: number; statementDay?: number; paymentDueDay?: number; color: string; createdAt: string; archived?: boolean; }
export interface Category { id: string; name: string; translations?: TranslationMap; icon: string; color: string; kind: 'income' | 'expense'; }
export interface Transaction { id: string; accountId: string; destinationAccountId?: string; categoryId?: string; kind: TransactionKind; amount: number; date: string; note?: string; noteTranslations?: TranslationMap; tags: string[]; createdAt: string; status?: TransactionStatus; recurringId?: string; debtId?: string; updatedAt?: string; }
export interface Budget { id: string; categoryId: string; month: string; limit: number; }
export type RecurringCadence = 'weekly' | 'monthly' | 'yearly' | `months_${number}`;
export interface Recurring { id: string; name: string; accountId?: string; categoryId?: string; kind: Extract<TransactionKind, 'income' | 'expense' | 'credit_purchase'>; amount: number; cadence: RecurringCadence; monthlyReserve?: number; /** First month of the current amount-saving cycle. */ reserveCycleStartDate?: string; nextDate: string; startDate?: string; endDate?: string; totalInstallments?: number; paidInstallments?: number; active: boolean; skippedDates?: string[]; }
export interface Debt { id: string; direction: 'owed_by_me' | 'owed_to_me'; counterparty: string; originalAmount: number; remainingAmount: number; accountId: string; issueDate: string; dueDate?: string; note?: string; status: 'active' | 'partially_paid' | 'settled'; createdAt: string; }
export interface DebtPayment { id: string; debtId: string; accountId: string; amount: number; date: string; note?: string; transactionId?: string; createdAt: string; }
export interface LocalBackup { id: string; createdAt: string; reason: 'before_import' | 'before_restore'; payload: string; schemaVersion: number; }
export interface SyncMetadata { id: 'google-drive'; connectedAt?: string; lastSyncAt?: string; remoteModifiedAt?: string; fileId?: string; }
export interface AppSettings { id: 'app'; currency: string; darkMode: boolean; displayName?: string; language?: 'en' | 'ar'; appearance?: 'light' | 'dark' | 'system'; googleClientId?: string; translationEndpoint?: string; }
