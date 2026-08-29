import { v4 as uuid } from 'uuid';
import { db } from '../database/db';
import { isValidBackup } from '../utils/validation';

export const BACKUP_SCHEMA_VERSION = 2;
const backupTables = ['accounts', 'transactions', 'categories', 'budgets', 'recurring', 'goals', 'plannedTransactions', 'settings', 'notifications', 'attachments', 'debts', 'debtPayments', 'syncMetadata'] as const;
export interface FinanceBackup { schemaVersion: number; exportedAt: string; data: Record<string, unknown[]>; }

export async function createBackup(): Promise<FinanceBackup> {
  const data = Object.fromEntries(await Promise.all(backupTables.map(async name => [name, await (db as unknown as Record<string, { toArray(): Promise<unknown[]> }>)[name].toArray()])));
  return { schemaVersion: BACKUP_SCHEMA_VERSION, exportedAt: new Date().toISOString(), data };
}

export function parseBackup(raw: string): FinanceBackup {
  const candidate: unknown = JSON.parse(raw);
  if (!candidate || typeof candidate !== 'object') throw new Error('This backup file is not valid JSON.');
  const envelope = candidate as Partial<FinanceBackup>;
  const data = envelope.data ?? candidate;
  if (!isValidBackup(data)) throw new Error('This backup does not contain valid finance data.');
  return { schemaVersion: envelope.schemaVersion ?? 1, exportedAt: envelope.exportedAt ?? '', data };
}

export async function preserveLocalBackup(reason: 'before_import' | 'before_restore'): Promise<void> {
  const backup = await createBackup();
  await db.localBackups.add({ id: uuid(), createdAt: new Date().toISOString(), reason, payload: JSON.stringify(backup), schemaVersion: BACKUP_SCHEMA_VERSION });
}

export async function restoreBackup(backup: FinanceBackup): Promise<void> {
  await preserveLocalBackup('before_restore');
  const tables = [db.accounts, db.transactions, db.categories, db.budgets, db.recurring, db.goals, db.plannedTransactions, db.settings, db.notifications, db.attachments, db.debts, db.debtPayments, db.syncMetadata] as const;
  await db.transaction('rw', ...tables, async () => {
    for (const table of tables) {
      if (table.name === 'localBackups') continue;
      await table.clear();
      const values = backup.data[table.name];
      if (values?.length) await table.bulkAdd(values);
    }
  });
}
