import type { Account, Transaction } from '../core/types';

export function validateAmount(value: number): string | undefined {
  if (!Number.isFinite(value) || value <= 0) return 'Amount must be greater than zero.';
  return undefined;
}

export function validateTransfer(sourceId: string, destinationId: string, accounts: Account[]): string | undefined {
  if (sourceId === destinationId) return 'Choose two different accounts.';
  const source = accounts.find(account => account.id === sourceId);
  const destination = accounts.find(account => account.id === destinationId);
  if (!source || !destination) return 'Choose valid accounts.';
  if (source.type === 'credit') return 'A credit card cannot be a transfer source.';
  if (destination.type === 'credit') return 'Use a credit-card payment instead of a transfer.';
  return undefined;
}

export function isValidBackup(payload: unknown): payload is Record<string, unknown[]> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const candidate = payload as Record<string, unknown>;
  return ['accounts', 'transactions', 'categories'].every(key => Array.isArray(candidate[key]));
}

export function sanitizeText(value: string, maximumLength = 120): string {
  return value.replace(/[<>]/g, '').trim().slice(0, maximumLength);
}

export function transactionIsFinancial(transaction: Transaction): boolean {
  return transaction.status !== 'void';
}
