import { CURRENCIES, DEFAULT_CURRENCY } from '../constants/theme';

// Set by SettingsProvider whenever the user picks a currency.
let currency = CURRENCIES.find((c) => c.code === DEFAULT_CURRENCY);

export function setCurrency(code) {
  currency = CURRENCIES.find((c) => c.code === code) || currency;
}

export function getCurrencySymbol() {
  return currency.symbol;
}

export function formatMoney(amount, decimals = 2) {
  const n = Number(amount) || 0;
  const formatted = Math.abs(n).toLocaleString(currency.locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${n < 0 ? '-' : ''}${currency.symbol}${formatted}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function monthLabel(year, month) {
  return `${MONTHS[month]} ${year}`;
}

export function isSameMonth(iso, year, month) {
  const d = new Date(iso);
  return d.getFullYear() === year && d.getMonth() === month;
}

// Accepts "YYYY-MM-DD"; returns ISO string or null
export function parseDateInput(text) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export function toDateInput(iso) {
  const d = new Date(iso);
  const pad = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
