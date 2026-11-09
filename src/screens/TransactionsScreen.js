import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTransactions } from '../context/TransactionsContext';
import { useThemedStyles } from '../context/SettingsContext';
import { colors } from '../constants/theme';
import { isSameMonth } from '../utils/format';
import { confirmAction } from '../utils/confirm';
import { Inbox } from 'lucide-react-native';
import MonthSwitcher from '../components/MonthSwitcher';
import SummaryCard from '../components/SummaryCard';
import TransactionItem from '../components/TransactionItem';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'income', label: 'Income' },
  { key: 'expense', label: 'Expense' },
];

export default function TransactionsScreen({ onEdit }) {
  const styles = useThemedStyles(getStyles);
  const { transactions, deleteTransaction, loaded } = useTransactions();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [filter, setFilter] = useState('all');

  const monthTxns = useMemo(
    () => transactions.filter((t) => isSameMonth(t.date, year, month)),
    [transactions, year, month]
  );

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    monthTxns.forEach((t) => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });
    return { income, expense };
  }, [monthTxns]);

  const visible = filter === 'all' ? monthTxns : monthTxns.filter((t) => t.type === filter);

  const confirmDelete = (item) => {
    confirmAction('Delete transaction?', item.note || 'This cannot be undone.', 'Delete', () =>
      deleteTransaction(item.id)
    );
  };

  if (!loaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>Transactions</Text>
        <MonthSwitcher year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
      </View>

      <SummaryCard income={totals.income} expense={totals.expense} />

      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.chip, filter === f.key && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TransactionItem item={item} onPress={() => onEdit(item)} onLongPress={() => confirmDelete(item)} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Inbox size={40} color={colors.muted} strokeWidth={1.5} />
            <Text style={styles.emptyText}>No transactions this month.</Text>
            <Text style={styles.emptyHint}>Tap + to add one.</Text>
          </View>
        }
        ListFooterComponent={
          visible.length > 0 ? <Text style={styles.hint}>Tap to edit · Long-press to delete</Text> : null
        }
      />
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  appTitle: { color: colors.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.5, marginBottom: 12 },
  filters: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 16, marginBottom: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.muted, fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: colors.onPrimary, fontWeight: '700' },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  empty: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: colors.text, fontSize: 15, marginTop: 8, fontWeight: '500' },
  emptyHint: { color: colors.muted, fontSize: 13, marginTop: 4 },
  hint: { textAlign: 'center', color: colors.muted, fontSize: 12, marginTop: 8 },
});
