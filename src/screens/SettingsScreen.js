import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Share } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { useTransactions } from '../context/TransactionsContext';
import { useAccounts } from '../context/AccountsContext';
import { useCategories } from '../context/CategoriesContext';
import CategoriesScreen from './CategoriesScreen';
import { colors, cardShadow, CURRENCIES } from '../constants/theme';
import { confirmAction, notify } from '../utils/confirm';
import { version } from '../../package.json';
import { Download, Trash2, ChevronRight, Check, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';

export default function SettingsScreen() {
  const { settings, setCurrencyCode } = useSettings();
  const { transactions, clearAll } = useTransactions();
  const { accounts, resetAccounts } = useAccounts();
  const { categories, resetCategories } = useCategories();
  const [page, setPage] = useState(null); // null | 'expense' | 'income' (category lists)
  const closePage = useCallback(() => setPage(null), []);

  const exportData = async () => {
    const json = JSON.stringify({ exportedAt: new Date().toISOString(), settings, accounts, categories, transactions }, null, 2);
    try {
      if (Platform.OS === 'web') {
        const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `spends-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        await Share.share({ title: 'Spends export', message: json });
      }
    } catch (e) {
      notify('Export failed', String(e.message || e));
    }
  };

  const clearData = () =>
    confirmAction(
      'Clear all data?',
      'This deletes every transaction and resets your accounts and categories. It cannot be undone.',
      'Clear',
      () => {
        clearAll();
        resetAccounts();
        resetCategories();
      }
    );

  if (page) return <CategoriesScreen type={page} onBack={closePage} />;

  const summary = (type) => {
    const list = categories.filter((c) => c.type === type);
    const subs = list.reduce((n, c) => n + c.subcategories.length, 0);
    return `${list.length} categories · ${subs} sub-categories`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.sectionTitle}>Currency</Text>
        <View style={styles.card}>
          {CURRENCIES.map((c, i) => {
            const selected = settings.currency === c.code;
            return (
              <TouchableOpacity
                key={c.code}
                style={[styles.row, i > 0 && styles.rowBorder]}
                onPress={() => setCurrencyCode(c.code)}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
              >
                <Text style={styles.symbol}>{c.symbol}</Text>
                <Text style={styles.rowLabel}>{c.label}</Text>
                <Text style={styles.code}>{c.code}</Text>
                <View style={[styles.check, !selected && { opacity: 0 }]}>
                  <Check size={18} color={colors.primary} strokeWidth={2.5} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => setPage('expense')}>
            <View style={styles.rowIcon}><ArrowUpRight size={18} color={colors.expense} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Expense categories</Text>
              <Text style={styles.rowHint}>{summary('expense')}</Text>
            </View>
            <ChevronRight size={18} color={colors.muted} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={() => setPage('income')}>
            <View style={styles.rowIcon}><ArrowDownLeft size={18} color={colors.income} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Income categories</Text>
              <Text style={styles.rowHint}>{summary('income')}</Text>
            </View>
            <ChevronRight size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Data</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={exportData}>
            <View style={styles.rowIcon}><Download size={18} color={colors.text} /></View>
            <Text style={styles.rowLabel}>Export data (JSON)</Text>
            <ChevronRight size={18} color={colors.muted} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={clearData}>
            <View style={styles.rowIcon}><Trash2 size={18} color={colors.expense} /></View>
            <Text style={[styles.rowLabel, { color: colors.expense }]}>Clear all data</Text>
            <ChevronRight size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <InfoRow label="Version" value={version} first />
          <InfoRow label="Transactions" value={String(transactions.length)} />
          <InfoRow label="Accounts" value={String(accounts.length)} />
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value, first }) {
  return (
    <View style={[styles.row, !first && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.code}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  body: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: { backgroundColor: colors.card, borderRadius: 16, paddingHorizontal: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.border, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  symbol: { width: 28, fontSize: 18, fontWeight: '600', color: colors.text },
  rowIcon: { width: 30 },
  rowLabel: { flex: 1, fontSize: 15, color: colors.text },
  code: { fontSize: 14, color: colors.muted },
  rowHint: { fontSize: 12, color: colors.muted, marginTop: 2 },
  check: { width: 24, alignItems: 'flex-end' },
});
