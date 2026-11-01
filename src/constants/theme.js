export const colors = {
  background: '#FFFFFF', // page
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

// Soft shadow for cards: lifts them off the white page (cards have no border)
export const cardShadow = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};
