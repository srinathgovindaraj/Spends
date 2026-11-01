export const colors = {
  background: '#EDEDED', // page
  card: '#FFFFFF',       // cards, list rows, sheets, navbar
  elevated: '#F0F0F2',   // inputs, toggles, icon circles
  border: '#E5E5EA',
  text: '#1D1D1F',
  muted: '#6E6E73',
  primary: '#0010FF',    // accent: buttons, active tab, links, selections
  onPrimary: '#FFFFFF',  // text/icons placed on primary
  primaryLight: '#E6E8FF', // light tint of primary
  income: '#248A3D',
  expense: '#D70015',
};

// Currencies selectable in Settings. Add more here if you need them.
export const CURRENCIES = [
  { code: 'INR', symbol: '₹', locale: 'en-IN', label: 'Indian Rupee' },
  { code: 'USD', symbol: '$', locale: 'en-US', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', locale: 'en-IE', label: 'Euro' },
  { code: 'GBP', symbol: '£', locale: 'en-GB', label: 'British Pound' },
];
export const DEFAULT_CURRENCY = 'INR';

// Soft drop shadow used on raised cards and buttons
export const shadow = {
  shadowColor: '#000',
  shadowOpacity: 0.12,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
};

// Very light shadow for cards: just enough to lift them off the grey page
export const cardShadow = {
  shadowColor: '#000',
  shadowOpacity: 0.04,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
};
