import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Share } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { useTransactions } from '../context/TransactionsContext';
import { useAccounts } from '../context/AccountsContext';
import { useCategories } from '../context/CategoriesContext';
import CategoriesScreen from './CategoriesScreen';
import { colors, cardShadow, CURRENCIES } from '../constants/theme';
import { LANGUAGES, APPEARANCES } from '../utils/i18n';
import { confirmAction, notify } from '../utils/confirm';
import { version } from '../../package.json';
import {
  Download, Trash2, ChevronRight, ChevronLeft, Check,
  ArrowUpRight, ArrowDownLeft, Palette, Globe, Coins, Sun, Moon,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { settings, setCurrencyCode, setAppearance, setLanguage, t } = useSettings();
  const { transactions, clearAll } = useTransactions();
  const { accounts, resetAccounts } = useAccounts();
  const { categories, resetCategories } = useCategories();
  const [page, setPage] = useState(null); // null | 'appearance' | 'language' | 'currency' | 'expense' | 'income'
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

  if (page === 'expense' || page === 'income') {
    return <CategoriesScreen type={page} onBack={closePage} />;
  }

  if (page === 'appearance') {
    return (
      <View style={styles.container}>
        <View style={styles.subHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={closePage} accessibilityLabel="Back">
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.subTitle}>{t('appearance')}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.sectionTitle}>{t('selectAppearance')}</Text>
          <View style={styles.card}>
            {APPEARANCES.map((item, i) => {
              const selected = (settings.appearance || 'light') === item.key;
              const Icon = item.key === 'dark' ? Moon : item.key === 'light' ? Sun : Palette;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.row, i > 0 && styles.rowBorder]}
                  onPress={() => setAppearance(item.key)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                >
                  <View style={styles.rowIcon}>
                    <Icon size={20} color={selected ? colors.primary : colors.text} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowLabel, selected && { fontWeight: '700' }]}>{t(item.key)}</Text>
                    <Text style={styles.rowHint}>{item.desc}</Text>
                  </View>
                  <View style={[styles.check, !selected && { opacity: 0 }]}>
                    <Check size={18} color={colors.primary} strokeWidth={2.5} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }

  if (page === 'language') {
    return (
      <View style={styles.container}>
        <View style={styles.subHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={closePage} accessibilityLabel="Back">
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.subTitle}>{t('language')}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.sectionTitle}>{t('selectLanguage')}</Text>
          <View style={styles.card}>
            {LANGUAGES.map((item, i) => {
              const selected = (settings.language || 'en') === item.code;
              return (
                <TouchableOpacity
                  key={item.code}
                  style={[styles.row, i > 0 && styles.rowBorder]}
                  onPress={() => setLanguage(item.code)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowLabel, selected && { fontWeight: '700' }]}>{item.native}</Text>
                    <Text style={styles.rowHint}>{item.label}</Text>
                  </View>
                  <View style={[styles.check, !selected && { opacity: 0 }]}>
                    <Check size={18} color={colors.primary} strokeWidth={2.5} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }

  if (page === 'currency') {
    return (
      <View style={styles.container}>
        <View style={styles.subHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={closePage} accessibilityLabel="Back">
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.subTitle}>{t('currency')}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.sectionTitle}>{t('selectCurrency')}</Text>
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
                  <Text style={[styles.rowLabel, selected && { fontWeight: '700' }]}>{c.label}</Text>
                  <Text style={styles.code}>{c.code}</Text>
                  <View style={[styles.check, !selected && { opacity: 0 }]}>
                    <Check size={18} color={colors.primary} strokeWidth={2.5} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }

  const summary = (type) => {
    const list = categories.filter((c) => c.type === type);
    const subs = list.reduce((n, c) => n + c.subcategories.length, 0);
    return `${list.length} categories · ${subs} sub-categories`;
  };

  const currObj = CURRENCIES.find((c) => c.code === settings.currency) || CURRENCIES[0];
  const langObj = LANGUAGES.find((l) => l.code === settings.language) || LANGUAGES[0];
  const appLabel = t(settings.appearance || 'light');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.sectionTitle}>{t('preferences')}</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => setPage('appearance')} activeOpacity={0.7}>
            <View style={styles.rowIcon}><Palette size={18} color={colors.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{t('appearance')}</Text>
              <Text style={styles.rowHint}>{appLabel}</Text>
            </View>
            <ChevronRight size={18} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={() => setPage('language')} activeOpacity={0.7}>
            <View style={styles.rowIcon}><Globe size={18} color="#10B981" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{t('language')}</Text>
              <Text style={styles.rowHint}>{langObj.native}</Text>
            </View>
            <ChevronRight size={18} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={() => setPage('currency')} activeOpacity={0.7}>
            <View style={styles.rowIcon}><Coins size={18} color="#F59E0B" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{t('currency')}</Text>
              <Text style={styles.rowHint}>{currObj.label} ({currObj.symbol})</Text>
            </View>
            <ChevronRight size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t('categories')}</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => setPage('expense')}>
            <View style={styles.rowIcon}><ArrowUpRight size={18} color={colors.expense} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{t('expenseCategories')}</Text>
              <Text style={styles.rowHint}>{summary('expense')}</Text>
            </View>
            <ChevronRight size={18} color={colors.muted} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={() => setPage('income')}>
            <View style={styles.rowIcon}><ArrowDownLeft size={18} color={colors.income} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{t('incomeCategories')}</Text>
              <Text style={styles.rowHint}>{summary('income')}</Text>
            </View>
            <ChevronRight size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t('data')}</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={exportData}>
            <View style={styles.rowIcon}><Download size={18} color={colors.text} /></View>
            <Text style={styles.rowLabel}>{t('exportData')}</Text>
            <ChevronRight size={18} color={colors.muted} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={clearData}>
            <View style={styles.rowIcon}><Trash2 size={18} color={colors.expense} /></View>
            <Text style={[styles.rowLabel, { color: colors.expense }]}>{t('clearAllData')}</Text>
            <ChevronRight size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t('about')}</Text>
        <View style={styles.card}>
          <InfoRow label={t('version')} value={version} first />
          <InfoRow label={t('transactions')} value={String(transactions.length)} />
          <InfoRow label={t('accounts')} value={String(accounts.length)} />
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
  subHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 16, paddingBottom: 16 },
  backBtn: { padding: 8, marginRight: 4 },
  subTitle: { color: colors.text, fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
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
  card: { backgroundColor: colors.card, borderRadius: 16, paddingHorizontal: 14, marginBottom: 16, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  symbol: { width: 32, fontSize: 18, fontWeight: '600', color: colors.text },
  rowIcon: { width: 30 },
  rowLabel: { flex: 1, fontSize: 15, color: colors.text },
  code: { fontSize: 14, color: colors.muted },
  rowHint: { fontSize: 12, color: colors.muted, marginTop: 2 },
  check: { width: 24, alignItems: 'flex-end' },
});
