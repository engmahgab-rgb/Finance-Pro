import type { Account, Transaction } from '../core/types';

export interface LedgerSummary { assets: number; liabilities: number; netWorth: number; income: number; expenses: number; cashFlow: number; }

const isPosted = (transaction: Transaction): boolean => transaction.status !== 'void';

/** Calculates one account balance without treating account-to-account movements as income or expense. */
export function accountBalanceFromLedger(account: Account, transactions: Transaction[]): number {
  return transactions.filter(isPosted).reduce((balance, transaction) => {
    const isSource = transaction.accountId === account.id;
    const isDestination = transaction.destinationAccountId === account.id;
    if (!isSource && !isDestination) return balance;
    if (account.type === 'credit') {
      if (isSource && (transaction.kind === 'credit_purchase' || transaction.kind === 'expense')) return balance + transaction.amount;
      if (isDestination && (transaction.kind === 'credit_payment' || transaction.kind === 'transfer')) return Math.max(0, balance - transaction.amount);
      if (isSource && transaction.kind === 'balance_adjustment_in') return balance + transaction.amount;
      if (isSource && transaction.kind === 'balance_adjustment_out') return Math.max(0, balance - transaction.amount);
      return balance;
    }
    if (isDestination) return balance + transaction.amount;
    if (transaction.kind === 'income' || transaction.kind === 'refund' || transaction.kind === 'loan_received' || transaction.kind === 'balance_adjustment_in') return balance + transaction.amount;
    if (transaction.kind === 'balance_adjustment_out') return balance - transaction.amount;
    return balance - transaction.amount;
  }, account.openingBalance);
}

export function summarizeLedger(accounts: Account[], transactions: Transaction[]): LedgerSummary {
  const balances = new Map(accounts.map(account => [account.id, accountBalanceFromLedger(account, transactions)]));
  const assets = accounts.filter(account => account.type !== 'credit').reduce((total, account) => total + (balances.get(account.id) ?? 0), 0);
  const liabilities = accounts.filter(account => account.type === 'credit').reduce((total, account) => total + (balances.get(account.id) ?? 0), 0);
  const posted = transactions.filter(isPosted);
  const income = posted.filter(item => item.kind === 'income' || item.kind === 'refund').reduce((total, item) => total + item.amount, 0);
  const expenses = posted.filter(item => item.kind === 'expense' || item.kind === 'credit_purchase').reduce((total, item) => total + item.amount, 0);
  return { assets, liabilities, netWorth: assets - liabilities, income, expenses, cashFlow: income - expenses };
}

export function creditAvailable(account: Account, transactions: Transaction[]): number | undefined {
  if (account.type !== 'credit' || !account.creditLimit) return undefined;
  return Math.max(0, account.creditLimit - accountBalanceFromLedger(account, transactions));
}
