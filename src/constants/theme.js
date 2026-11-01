export const lightColors = {
  background: '#F5F5F5', // application background - light gray
  card: '#FFFFFF',       // cards, list rows, sheets, navbar - white
  elevated: '#EAEAEF',   // inputs, toggles, icon circles, balance strip
  border: '#E5E5EA',
  text: '#1D1D1F',
  muted: '#6E6E73',
  primary: '#0010FF',    // accent: buttons, active tab, links, selections
  onPrimary: '#FFFFFF',  // text/icons placed on primary
  primaryLight: '#E6E8FF', // light tint of primary
  income: '#248A3D',
  expense: '#D70015',
};

export const darkColors = {
  background: '#121214', // dark mode page background
  card: '#1C1C1E',       // dark cards
  elevated: '#2C2C2E',   // dark inputs, strips, chips
  border: '#38383A',
  text: '#F5F5F7',
  muted: '#8E8E93',
  primary: '#2B50FF',
  onPrimary: '#FFFFFF',
  primaryLight: '#1B2654',
  income: '#30D158',
  expense: '#FF453A',
};

export const colors = { ...lightColors };

export function applyTheme(mode) {
  let isDark = mode === 'dark';
  if (mode === 'system' && typeof window !== 'undefined' && window.matchMedia) {
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  const next = isDark ? darkColors : lightColors;
  Object.assign(colors, next);
  if (typeof document !== 'undefined') {
    document.body.style.backgroundColor = next.background;
  }
  return isDark;
}

// Currencies selectable in Settings.
export const CURRENCIES = [
  { code: 'INR', symbol: '₹', locale: 'en-IN', label: 'Indian Rupee' },
  { code: 'USD', symbol: '$', locale: 'en-US', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', locale: 'en-IE', label: 'Euro' },
  { code: 'GBP', symbol: '£', locale: 'en-GB', label: 'British Pound' },
  { code: 'JPY', symbol: '¥', locale: 'ja-JP', label: 'Japanese Yen' },
  { code: 'CAD', symbol: '$', locale: 'en-CA', label: 'Canadian Dollar' },
  { code: 'AUD', symbol: '$', locale: 'en-AU', label: 'Australian Dollar' },
  { code: 'AED', symbol: 'AED', locale: 'ar-AE', label: 'UAE Dirham' },
  { code: 'SGD', symbol: '$', locale: 'en-SG', label: 'Singapore Dollar' },
  { code: 'CHF', symbol: 'CHF', locale: 'de-CH', label: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', locale: 'zh-CN', label: 'Chinese Yuan' },
];
export const DEFAULT_CURRENCY = 'INR';

// Soft drop shadow used on raised cards and buttons
export const shadow = {
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};

// Very light, subtle shadow for cards on light gray background
export const cardShadow = {
  shadowColor: '#000',
  shadowOpacity: 0.035,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
};
