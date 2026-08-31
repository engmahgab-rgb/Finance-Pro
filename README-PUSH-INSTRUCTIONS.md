# Finance Pro – mobile navigation fix

Replace/add these files in your GitHub repository, keeping the same paths:

1. Replace `index.html`
2. Add `src/mobile-nav.ts`
3. Add `src/mobile-nav.css`

No finance/database logic is changed.

## What this fixes

On screens up to 600 px wide, the fixed bottom bar becomes:

Dashboard | Accounts | Transactions | Recurring | More

`More` opens:
- Categories
- Budgets
- Forecast
- Reports
- Calendar
- Notifications
- Backup
- Settings

This means no existing page disappears on iPhone.

The five bottom-bar items are forced into five equal grid columns and stay on one line.
The More panel also highlights the current secondary page and supports closing by tapping outside or pressing Escape.

Desktop navigation remains unchanged.
