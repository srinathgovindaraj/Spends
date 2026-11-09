import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Platform, Share } from 'react-native';
import { useSettings, useThemedStyles } from '../context/SettingsContext';
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
  ArrowUpRight, ArrowDownLeft, Palette, Globe, Coins, Sun, Moon, Search, X,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { settings, setCurrencyCode, setAppearance, setLanguage, isDark, t } = useSettings();
  const styles = useThemedStyles(getStyles);
  const { transactions, clearAll } = useTransactions();
  const { accounts, resetAccounts } = useAccounts();
  const { categories, resetCategories } = useCategories();
  const [page, setPage] = useState(null); // null | 'appearance' | 'language' | 'currency' | 'expense' | 'income'
  const [currencyQuery, setCurrencyQuery] = useState('');

  const closePage = useCallback(() => {
    setPage(null);
    setCurrencyQuery('');
  }, []);

  const filteredCurrencies = useMemo(() => {
    const q = currencyQuery.trim().toLowerCase();
    if (!q) return CURRENCIES;
    return CURRENCIES.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );
  }, [currencyQuery]);

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
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.side} onPress={closePage} hitSlop={10} accessibilityLabel="Back">
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>{t('appearance')}</Text>
          <View style={styles.side} />
        </View>

        <ScrollView contentContainerStyle={styles.subBody} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>{t('selectAppearance')}</Text>
          <View style={styles.card}>
            {APPEARANCES.map((item, i) => {
              const selected = (settings.appearance || 'dark') === item.key;
              const Icon = item.key === 'dark' ? Moon : item.key === 'light' ? Sun : Palette;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.row, i > 0 && styles.rowBorder]}
                  onPress={() => setAppearance(item.key)}
                  activeOpacity={0.75}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                >
                  <View style={[styles.badgeBox, selected && styles.badgeBoxActive]}>
                    <Icon size={20} color={selected ? colors.onPrimary : colors.text} strokeWidth={2} />
                  </View>
                  <View style={styles.rowMiddle}>
                    <Text style={[styles.rowLabel, selected && styles.rowLabelSelected]}>{t(item.key)}</Text>
                    <Text style={styles.rowHint}>{item.desc}</Text>
                  </View>
                  <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
                    {selected && <Check size={14} color={colors.onPrimary} strokeWidth={3} />}
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
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.side} onPress={closePage} hitSlop={10} accessibilityLabel="Back">
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>{t('language')}</Text>
          <View style={styles.side} />
        </View>

        <ScrollView contentContainerStyle={styles.subBody} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>{t('selectLanguage')}</Text>
          <View style={styles.card}>
            {LANGUAGES.map((item, i) => {
              const selected = (settings.language || 'en') === item.code;
              return (
                <TouchableOpacity
                  key={item.code}
                  style={[styles.row, i > 0 && styles.rowBorder]}
                  onPress={() => setLanguage(item.code)}
                  activeOpacity={0.75}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                >
                  <View style={[styles.badgeBox, selected && styles.badgeBoxActive]}>
                    <Text style={[styles.badgeCodeText, selected && styles.badgeTextActive]}>
                      {item.code.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.rowMiddle}>
                    <Text style={[styles.rowLabel, selected && styles.rowLabelSelected]}>{item.native}</Text>
                    <Text style={styles.rowHint}>{item.label}</Text>
                  </View>
                  <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
                    {selected && <Check size={14} color={colors.onPrimary} strokeWidth={3} />}
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
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.side} onPress={closePage} hitSlop={10} accessibilityLabel="Back">
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>{t('currency')}</Text>
          <View style={styles.side} />
        </View>

        <ScrollView contentContainerStyle={styles.subBody} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.searchBar}>
            <Search size={18} color={colors.muted} />
            <TextInput
              style={styles.searchInput}
              value={currencyQuery}
              onChangeText={setCurrencyQuery}
              placeholder="Search currency or code..."
              placeholderTextColor={colors.muted}
              keyboardAppearance={isDark ? 'dark' : 'light'}
              accessibilityLabel="Search currency"
            />
            {currencyQuery.length > 0 && (
              <TouchableOpacity onPress={() => setCurrencyQuery('')} hitSlop={8} accessibilityLabel="Clear search">
                <X size={16} color={colors.muted} />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.sectionTitle}>{t('selectCurrency')}</Text>
          <View style={styles.card}>
            {filteredCurrencies.map((c, i) => {
              const selected = settings.currency === c.code;
              const isMultiChar = c.symbol.length > 1;
              return (
                <TouchableOpacity
                  key={c.code}
                  style={[styles.row, i > 0 && styles.rowBorder]}
                  onPress={() => setCurrencyCode(c.code)}
                  activeOpacity={0.75}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                >
                  <View style={[styles.badgeBox, selected && styles.badgeBoxActive]}>
                    <Text
                      style={[
                        styles.symbolText,
                        isMultiChar && styles.symbolTextCompact,
                        selected && styles.badgeTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {c.symbol}
                    </Text>
                  </View>

                  <View style={styles.rowMiddle}>
                    <Text style={[styles.rowLabel, selected && styles.rowLabelSelected]} numberOfLines={1}>
                      {c.label}
                    </Text>
                  </View>

                  <View style={[styles.codePill, selected && styles.codePillSelected]}>
                    <Text style={[styles.codePillText, selected && styles.codePillTextSelected]}>{c.code}</Text>
                  </View>

                  <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
                    {selected && <Check size={14} color={colors.onPrimary} strokeWidth={3} />}
                  </View>
                </TouchableOpacity>
              );
            })}
            {filteredCurrencies.length === 0 && (
              <Text style={styles.emptySearch}>No matching currencies found.</Text>
            )}
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
  const appLabel = t(settings.appearance || 'dark');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{t('preferences')}</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => setPage('appearance')} activeOpacity={0.7}>
            <View style={styles.iconBox}><Palette size={18} color={colors.primary} /></View>
            <View style={styles.rowMiddle}>
              <Text style={styles.rowLabel}>{t('appearance')}</Text>
              <Text style={styles.rowHint}>{appLabel}</Text>
            </View>
            <ChevronRight size={18} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={() => setPage('language')} activeOpacity={0.7}>
            <View style={styles.iconBox}><Globe size={18} color="#10B981" /></View>
            <View style={styles.rowMiddle}>
              <Text style={styles.rowLabel}>{t('language')}</Text>
              <Text style={styles.rowHint}>{langObj.native}</Text>
            </View>
            <ChevronRight size={18} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={() => setPage('currency')} activeOpacity={0.7}>
            <View style={styles.iconBox}><Coins size={18} color="#F59E0B" /></View>
            <View style={styles.rowMiddle}>
              <Text style={styles.rowLabel}>{t('currency')}</Text>
              <Text style={styles.rowHint}>{currObj.label} ({currObj.symbol})</Text>
            </View>
            <ChevronRight size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t('categories')}</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => setPage('expense')} activeOpacity={0.7}>
            <View style={styles.iconBox}><ArrowUpRight size={18} color={colors.expense} /></View>
            <View style={styles.rowMiddle}>
              <Text style={styles.rowLabel}>{t('expenseCategories')}</Text>
              <Text style={styles.rowHint}>{summary('expense')}</Text>
            </View>
            <ChevronRight size={18} color={colors.muted} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={() => setPage('income')} activeOpacity={0.7}>
            <View style={styles.iconBox}><ArrowDownLeft size={18} color={colors.income} /></View>
            <View style={styles.rowMiddle}>
              <Text style={styles.rowLabel}>{t('incomeCategories')}</Text>
              <Text style={styles.rowHint}>{summary('income')}</Text>
            </View>
            <ChevronRight size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t('data')}</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={exportData} activeOpacity={0.7}>
            <View style={styles.iconBox}><Download size={18} color={colors.text} /></View>
            <Text style={[styles.rowLabel, { flex: 1 }]}>{t('exportData')}</Text>
            <ChevronRight size={18} color={colors.muted} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={clearData} activeOpacity={0.7}>
            <View style={styles.iconBox}><Trash2 size={18} color={colors.expense} /></View>
            <Text style={[styles.rowLabel, { flex: 1, color: colors.expense }]}>{t('clearAllData')}</Text>
            <ChevronRight size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t('about')}</Text>
        <View style={styles.card}>
          <InfoRow label={t('version')} value={version} first styles={styles} />
          <InfoRow label={t('transactions')} value={String(transactions.length)} styles={styles} />
          <InfoRow label={t('accounts')} value={String(accounts.length)} styles={styles} />
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value, first, styles }) {
  return (
    <View style={[styles.row, !first && styles.rowBorder]}>
      <Text style={[styles.rowLabel, { flex: 1 }]}>{label}</Text>
      <Text style={styles.code}>{value}</Text>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  side: { width: 36, alignItems: 'flex-start', justifyContent: 'center' },
  topTitle: { fontSize: 18, fontWeight: '600', color: colors.text },

  body: { paddingHorizontal: 16, paddingBottom: 40 },
  subBody: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    marginLeft: 10,
    paddingVertical: 0,
    borderWidth: 0,
    outlineStyle: 'none',
  },
  emptySearch: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
  },

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
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    marginBottom: 16,
    ...cardShadow,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  badgeBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    paddingHorizontal: 4,
  },
  badgeBoxActive: {
    backgroundColor: colors.primary,
  },
  symbolText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  symbolTextCompact: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  badgeCodeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  badgeTextActive: {
    color: colors.onPrimary,
  },

  rowMiddle: { flex: 1, marginRight: 10 },
  rowLabel: { fontSize: 15, fontWeight: '500', color: colors.text },
  rowLabelSelected: { fontWeight: '700' },
  rowHint: { fontSize: 12, color: colors.muted, marginTop: 2 },

  codePill: {
    backgroundColor: colors.elevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },
  codePillSelected: {
    backgroundColor: colors.primaryLight,
  },
  codePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
  },
  codePillTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },

  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  code: { fontSize: 14, color: colors.muted },
});
