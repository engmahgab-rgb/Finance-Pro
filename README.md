# Finance Pro

An offline-first, installable personal-finance PWA. It uses IndexedDB through Dexie, with UUID primary keys for every record.

## Run locally

```bash
npm install
npm run dev
```

Use `npm run build` and `npm run lint` before committing. GitHub Pages is supported through the relative Vite `base` setting.

## Use on iPhone

Deploy the `main` branch with the included GitHub Pages workflow, then open the published HTTPS address in **Safari** on the iPhone. Tap **Share** → **Add to Home Screen** → **Add**. Finance Pro will open full-screen and its data will remain available offline after the first visit. iPhone storage is device-local; use the Backup screen before changing or resetting devices.

## Data ownership

All finance data is local to the device. The Backup screen exports JSON and safely imports an earlier JSON backup. The database schema includes future-ready tables for notifications, attachments, goals, and planned transactions.

## Architecture

- `src/core`: domain types
- `src/database`: Dexie schema and database instance
- `src/services`: business operations, independent of UI
- `src/main.ts`: application composition and UI routing

Feature pages include dashboard, accounts, transactions, categories, budgets, recurring, forecast, reports, calendar, notifications, backup, and settings.
