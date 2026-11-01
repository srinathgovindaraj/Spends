import { Banknote, Landmark, CreditCard, Wallet, PiggyBank, CircleHelp } from 'lucide-react-native';

export const ACCOUNT_TYPES = [
  { key: 'cash', label: 'Cash', Icon: Banknote, color: '#16A34A' },
  { key: 'bank', label: 'Bank', Icon: Landmark, color: '#2563EB' },
  { key: 'card', label: 'Card', Icon: CreditCard, color: '#DB2777' },
  { key: 'wallet', label: 'Wallet', Icon: Wallet, color: '#F59E0B' },
  { key: 'savings', label: 'Savings', Icon: PiggyBank, color: '#8B5CF6' },
];

export function getAccountType(key) {
  return ACCOUNT_TYPES.find((t) => t.key === key) || { key, label: 'Other', Icon: CircleHelp, color: '#94A3B8' };
}

// Transactions saved before accounts existed have no `account` field; they count as Cash.
export const DEFAULT_ACCOUNT_ID = 'cash';

export const DEFAULT_ACCOUNTS = [
  { id: 'cash', name: 'Cash', type: 'cash', openingBalance: 0 },
  { id: 'bank', name: 'Bank Account', type: 'bank', openingBalance: 0 },
  { id: 'card', name: 'Credit Card', type: 'card', openingBalance: 0 },
];

export function txnAccountId(t) {
  return t.account || DEFAULT_ACCOUNT_ID;
}

export function accountBalances(accounts, transactions) {
  const map = {};
  accounts.forEach((a) => { map[a.id] = Number(a.openingBalance) || 0; });
  transactions.forEach((t) => {
    const id = txnAccountId(t);
    if (!(id in map)) return;
    map[id] += t.type === 'income' ? t.amount : -t.amount;
  });
  return map;
}
