import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys keep the original app name so existing saved data still loads after the rename to Spends.
const STORAGE_KEY = '@money_manager/transactions';
const TransactionsContext = createContext(null);

function sampleData() {
  const now = new Date();
  const day = (d) => new Date(now.getFullYear(), now.getMonth(), d, 12).toISOString();
  return [
    { id: '1', type: 'income', amount: 50000, category: 'salary', account: 'bank', note: 'Monthly salary', date: day(1) },
    { id: '2', type: 'expense', amount: 12000, category: 'bills', account: 'bank', note: 'Rent', date: day(2) },
    { id: '3', type: 'expense', amount: 850, category: 'food', account: 'cash', note: 'Groceries', date: day(3) },
    { id: '4', type: 'expense', amount: 320, category: 'transport', account: 'cash', note: 'Metro card', date: day(4) },
    { id: '5', type: 'income', amount: 7500, category: 'freelance', account: 'bank', note: 'Logo design', date: day(5) },
    { id: '6', type: 'expense', amount: 1999, category: 'shopping', account: 'card', note: 'Shoes', date: day(6) },
  ].filter((t) => new Date(t.date) <= now);
}

export function TransactionsProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        setTransactions(raw ? JSON.parse(raw) : sampleData());
      } catch (e) {
        console.warn('Failed to load transactions', e);
        setTransactions(sampleData());
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)).catch((e) =>
      console.warn('Failed to save transactions', e)
    );
  }, [transactions, loaded]);

  const value = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    return {
      loaded,
      transactions: sorted,
      addTransaction: (t) =>
        setTransactions((prev) => [...prev, { ...t, id: Date.now().toString() }]),
      updateTransaction: (id, changes) =>
        setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } : t))),
      deleteTransaction: (id) => setTransactions((prev) => prev.filter((t) => t.id !== id)),
      clearAll: () => setTransactions([]),
    };
  }, [transactions, loaded]);

  return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>;
}

export function useTransactions() {
  const ctx = useContext(TransactionsContext);
  if (!ctx) throw new Error('useTransactions must be used inside TransactionsProvider');
  return ctx;
}
