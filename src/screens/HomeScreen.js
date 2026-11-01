import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, Pressable,
} from 'react-native';
import {
  Menu, Plus, ChevronDown, Check, TrendingUp, TrendingDown,
} from 'lucide-react-native';
import { useTransactions } from '../context/TransactionsContext';
import { useAccounts } from '../context/AccountsContext';
import { useSettings } from '../context/SettingsContext';
import { colors, cardShadow } from '../constants/theme';
import { accountBalances, txnAccountId } from '../constants/accounts';
import { formatMoney, isSameMonth } from '../utils/format';
import SectionHeader from '../components/SectionHeader';
import CategoryBreakdown from '../components/CategoryBreakdown';
import TrendChart from '../components/TrendChart';
import TransactionItem from '../components/TransactionItem';
import Logo from '../components/Logo';

const DAY = 24 * 60 * 60 * 1000;

function pctChange(curr, prev) {
  if (!prev) return null;
  return ((curr - prev) / Math.abs(prev)) * 100;
}

export default function HomeScreen({ onEdit, onAdd, onNavigate }) {
  const { transactions, loaded } = useTransactions();
  const { accounts } = useAccounts();
  const { t } = useSettings();
  const [selected, setSelected] = useState('all'); // 'all' or an account id
  const [pickerOpen, setPickerOpen] = useState(false);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();

  const stats = useMemo(() => {
    const scoped = selected === 'all' ? transactions : transactions.filter((t) => txnAccountId(t) === selected);
    const scopedAccounts = selected === 'all' ? accounts : accounts.filter((a) => a.id === selected);
    const balances = accountBalances(accounts, transactions);
    const total = scopedAccounts.reduce((sum, a) => sum + (balances[a.id] || 0), 0);

    const today = new Date(year, month, date).getTime();
    let todayExp = 0, yestExp = 0, weekExp = 0, prevWeekExp = 0;
    let monthInc = 0, monthExp = 0;

    scoped.forEach((t) => {
      const ts = new Date(t.date).getTime();
      const exp = t.type === 'expense';
      if (exp) {
        if (ts >= today && ts < today + DAY) todayExp += t.amount;
        else if (ts >= today - DAY && ts < today) yestExp += t.amount;
        if (ts >= today - 6 * DAY && ts < today + DAY) weekExp += t.amount;
        else if (ts >= today - 13 * DAY && ts < today - 6 * DAY) prevWeekExp += t.amount;
      }
      if (isSameMonth(t.date, year, month)) {
        if (exp) monthExp += t.amount;
        else monthInc += t.amount;
      }
    });

    const monthNet = monthInc - monthExp;
    return {
      scoped,
      total,
      balanceChange: pctChange(total, total - monthNet),
      todayExp,
      todayChange: pctChange(todayExp, yestExp),
      weekExp,
      weekChange: pctChange(weekExp, prevWeekExp),
      monthTxns: scoped.filter((t) => isSameMonth(t.date, year, month)),
    };
  }, [transactions, accounts, selected, year, month, date]);

  if (!loaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const selectedName = selected === 'all' ? t('allAccounts') : accounts.find((a) => a.id === selected)?.name || t('allAccounts');
  const recent = stats.scoped.slice(0, 5);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Logo size={30} />
        <Text style={styles.appName}>Spends</Text>
        <TouchableOpacity style={[styles.roundBtn, { marginRight: 8 }]} onPress={() => onAdd()} accessibilityLabel="Add transaction">
          <Plus size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.roundBtn} onPress={() => onNavigate('settings')} accessibilityLabel="Settings">
          <Menu size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Balance card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceTop}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardCaption}>{t('totalBalance')}</Text>
            <TouchableOpacity style={styles.accountPicker} onPress={() => setPickerOpen(true)} hitSlop={8}>
              <Text style={styles.accountPickerText} numberOfLines={1}>{selectedName}</Text>
              <ChevronDown size={16} color={colors.muted} />
            </TouchableOpacity>
          </View>
          <View style={styles.balanceRow}>
            <Text style={[styles.balance, stats.total < 0 && { color: colors.expense }]} numberOfLines={1} adjustsFontSizeToFit>
              {formatMoney(stats.total, 0)}
            </Text>
            <ChangeBadge value={stats.balanceChange} goodWhenUp />
          </View>
        </View>
        <View style={styles.balanceStrip}>
          <View style={styles.stripCol}>
            <Text style={styles.stripCaption}>{t('todaysExpense')}</Text>
            <View style={styles.stripRow}>
              <Text style={styles.stripValue}>-{formatMoney(stats.todayExp, 0)}</Text>
              <ChangeBadge value={stats.todayChange} small />
            </View>
          </View>
          <View style={styles.stripCol}>
            <Text style={styles.stripCaption}>{t('weeklyExpense')}</Text>
            <View style={styles.stripRow}>
              <Text style={styles.stripValue}>-{formatMoney(stats.weekExp, 0)}</Text>
              <ChangeBadge value={stats.weekChange} small />
            </View>
          </View>
        </View>
      </View>


      {/* Recent transactions */}
      <View style={styles.section}>
        <SectionHeader title={t('recentTransactions')} actionLabel={t('seeAll')} onAction={() => onNavigate('transactions')} />
        {recent.length === 0 ? (
          <Text style={styles.empty}>No transactions yet.</Text>
        ) : (
          recent.map((t) => <TransactionItem key={t.id} item={t} onPress={() => onEdit(t)} />)
        )}
      </View>

      {/* This month */}
      <View style={styles.section}>
        <SectionHeader title={t('thisMonth')} />
        <CategoryBreakdown transactions={stats.monthTxns} />
      </View>
      <View style={styles.section}>
        <TrendChart transactions={stats.scoped} year={year} month={month} />
      </View>

      {/* Account picker */}
      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setPickerOpen(false)}>
          <View style={styles.picker}>
            <Text style={styles.pickerTitle}>Show balance for</Text>
            {[{ id: 'all', name: 'All accounts' }, ...accounts].map((a) => (
              <TouchableOpacity
                key={a.id}
                style={styles.pickerRow}
                onPress={() => { setSelected(a.id); setPickerOpen(false); }}
              >
                <Text style={styles.pickerText}>{a.name}</Text>
                {selected === a.id && <Check size={18} color={colors.text} strokeWidth={2.5} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

// Small "+1.2%" pill. For expenses (goodWhenUp = false) a rise is shown in red.
function ChangeBadge({ value, goodWhenUp = false, small }) {
  if (value === null || !Number.isFinite(value)) return null;
  const up = value >= 0;
  const good = up === goodWhenUp;
  const color = good ? colors.income : colors.expense;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <View style={[styles.badge, { backgroundColor: color + '14' }, small && styles.badgeSmall]}>
      <Icon size={small ? 10 : 12} color={color} strokeWidth={2.5} />
      <Text style={[styles.badgeText, { color }, small && { fontSize: 10 }]}>
        {up ? '+' : ''}{value.toFixed(1)}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16 },
  appName: { flex: 1, marginLeft: 10, fontSize: 22, fontWeight: '700', letterSpacing: -0.3, color: colors.text },
  roundBtn: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  balanceCard: {
    marginHorizontal: 16,
    borderRadius: 22,
    backgroundColor: colors.card,
    ...cardShadow,
  },
  balanceTop: { padding: 18, paddingBottom: 22 },
  cardCaption: { fontSize: 15, color: colors.muted },
  accountPicker: { flexDirection: 'row', alignItems: 'center', maxWidth: 160 },
  accountPickerText: { fontSize: 13, color: colors.muted, marginRight: 4 },
  balanceRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 14 },
  balance: { fontSize: 38, fontWeight: '700', letterSpacing: -1, color: colors.text, flexShrink: 1, marginRight: 8 },
  balanceStrip: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderBottomLeftRadius: 21,
    borderBottomRightRadius: 21,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  stripCol: { flex: 1 },
  stripCaption: { fontSize: 12, color: colors.muted },
  stripRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, flexWrap: 'wrap' },
  stripValue: { fontSize: 17, fontWeight: '700', color: colors.text, marginRight: 6 },

  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10, marginTop: 4 },
  badgeSmall: { paddingHorizontal: 5, paddingVertical: 2, marginTop: 0 },
  badgeText: { fontSize: 11, fontWeight: '700', marginLeft: 3 },

  actions: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 18 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 8,
    marginRight: 10,
  },
  actionPrimary: { backgroundColor: colors.primary },
  actionSecondary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  actionText: { fontSize: 16, fontWeight: '600', color: colors.text, marginLeft: 8 },
  actionRound: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  section: { paddingHorizontal: 16, marginTop: 24 },
  empty: { color: colors.muted, textAlign: 'center', paddingVertical: 16 },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', padding: 32 },
  picker: { backgroundColor: colors.card, borderRadius: 18, paddingVertical: 8 },
  pickerTitle: { fontSize: 13, color: colors.muted, paddingHorizontal: 18, paddingVertical: 10 },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pickerText: { fontSize: 16, color: colors.text },
});
