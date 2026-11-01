import React, { createContext, useContext, useMemo } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import { DEFAULT_ACCOUNTS } from '../constants/accounts';

const AccountsContext = createContext(null);

export function AccountsProvider({ children }) {
  const [accounts, setAccounts, loaded] = usePersistentState('@money_manager/accounts', () => DEFAULT_ACCOUNTS);

  const value = useMemo(
    () => ({
      accounts,
      loaded,
      getAccount: (id) => accounts.find((a) => a.id === id) || { id, name: 'Unknown', type: 'other' },
      addAccount: (a) => setAccounts((prev) => [...prev, { ...a, id: Date.now().toString() }]),
      updateAccount: (id, changes) =>
        setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...changes } : a))),
      deleteAccount: (id) => setAccounts((prev) => prev.filter((a) => a.id !== id)),
      resetAccounts: () => setAccounts(DEFAULT_ACCOUNTS),
    }),
    [accounts, loaded, setAccounts]
  );

  return <AccountsContext.Provider value={value}>{children}</AccountsContext.Provider>;
}

export function useAccounts() {
  const ctx = useContext(AccountsContext);
  if (!ctx) throw new Error('useAccounts must be used inside AccountsProvider');
  return ctx;
}
