import { BarController, BarElement, CategoryScale, Chart, Colors, Legend, LinearScale, Tooltip } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, Colors, Legend, LinearScale, Tooltip);

/** Renders an accessible, data-only category spending chart. */
export function renderCategorySpendingChart(canvas: HTMLCanvasElement, labels: string[], amounts: number[]): Chart | undefined {
  if (!labels.length || !amounts.some(amount => amount > 0)) return undefined;
  return new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Spending (SAR)', data: amounts, backgroundColor: '#1769e0', borderRadius: 8 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: context => `SAR ${Number(context.raw).toLocaleString('en-SA', { minimumFractionDigits: 2 })}` } } }, scales: { y: { beginAtZero: true, ticks: { callback: value => `SAR ${value}` } }, x: { grid: { display: false } } } },
  });
}
