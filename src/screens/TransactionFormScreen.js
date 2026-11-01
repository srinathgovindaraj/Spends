import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, BackHandler,
} from 'react-native';
import { ChevronLeft, ChevronDown, ChevronRight, Trash2, Tag, FileText } from 'lucide-react-native';
import { useTransactions } from '../context/TransactionsContext';
import { useAccounts } from '../context/AccountsContext';
import { useCategories } from '../context/CategoriesContext';
import { useSettings } from '../context/SettingsContext';
import { colors, cardShadow, shadow } from '../constants/theme';
import { getAccountType, txnAccountId } from '../constants/accounts';
import { getCurrencySymbol } from '../utils/format';
import { confirmAction, notify } from '../utils/confirm';
import TypeSwitch from '../components/TypeSwitch';
import DatePickerModal from '../components/DatePickerModal';
import CategoryPickerModal from '../components/CategoryPickerModal';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// "Nov 01,2026"
const chipDate = (d) => `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')},${d.getFullYear()}`;

function todayNoon() {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d;
}

// Full-page form for adding (editing = null) or editing a transaction.
export default function TransactionFormScreen({ editing, initialType = 'expense', onClose }) {
  const { addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { accounts } = useAccounts();
  const { byType, getCategory, getSubcategory } = useCategories();
  const { t } = useSettings();

  const [type, setType] = useState(editing ? editing.type : initialType);
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '');
  const [date, setDate] = useState(editing ? new Date(editing.date) : todayNoon());
  const [account, setAccount] = useState(editing ? txnAccountId(editing) : accounts[0]?.id);
  const [category, setCategory] = useState(editing ? editing.category : null);
  const [subcategory, setSubcategory] = useState(editing ? editing.subcategory || null : null);
  const [note, setNote] = useState(editing ? editing.note || '' : '');
  const [dateOpen, setDateOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  // Android hardware back closes the page instead of the app
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [onClose]);

  const categories = byType(type);
  const cat = category ? getCategory(category) : null;
  const sub = category && subcategory ? getSubcategory(category, subcategory) : null;

  const switchType = (t) => {
    if (t === type) return;
    setType(t);
    setCategory(null); // expense and income have different categories
    setSubcategory(null);
  };

  const save = () => {
    const value = parseFloat(amount.replace(',', '.'));
    if (!value || value <= 0) {
      notify('Enter an amount', 'The amount must be greater than 0.');
      return;
    }
    if (!category) {
      notify('Choose a category', 'Select a category for this transaction.');
      return;
    }
    const data = {
      type,
      amount: Math.round(value * 100) / 100,
      account,
      category,
      subcategory: sub ? subcategory : null,
      note: note.trim(),
      date: date.toISOString(),
    };
    if (editing) updateTransaction(editing.id, data);
    else addTransaction(data);
    onClose();
  };

  const remove = () =>
    confirmAction('Delete transaction?', 'This cannot be undone.', 'Delete', () => {
      deleteTransaction(editing.id);
      onClose();
    });

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.side} onPress={onClose} hitSlop={10} accessibilityLabel="Back">
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Transaction</Text>
        <View style={styles.side}>
          {editing && (
            <TouchableOpacity onPress={remove} hitSlop={10} accessibilityLabel="Delete transaction">
              <Trash2 size={20} color={colors.expense} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scroller}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        <TypeSwitch value={type} onChange={switchType} />

        {/* Amount + date */}
        <View style={styles.amountCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.caption}>Total Balance</Text>
            <TouchableOpacity style={styles.dateChip} onPress={() => setDateOpen(true)} accessibilityLabel="Change date">
              <ChevronDown size={14} color={colors.muted} />
              <Text style={styles.dateChipText}>{chipDate(date)}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.currency}>{getCurrencySymbol()}</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.text}
              autoFocus={!editing}
              keyboardAppearance="light"
              accessibilityLabel="Amount"
            />
          </View>
        </View>

        {/* Account */}
        <Text style={styles.sectionLabel}>{t ? t('account') : 'Account'}</Text>
        <View style={styles.accountTrack}>
          {accounts.map((a) => {
            const accType = getAccountType(a.type);
            const selected = account === a.id;
            return (
              <TouchableOpacity
                key={a.id}
                style={[styles.accountTab, selected && styles.accountTabActive]}
                onPress={() => setAccount(a.id)}
                activeOpacity={0.75}
              >
                <accType.Icon size={15} color={selected ? colors.text : colors.muted} strokeWidth={selected ? 2.2 : 1.75} />
                <Text style={[styles.accountTabText, selected && styles.accountTabTextActive]} numberOfLines={1}>
                  {a.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Category + note */}
        <View style={styles.detailsCard}>
          <TouchableOpacity style={styles.fieldRow} onPress={() => setCatOpen(true)} activeOpacity={0.7}>
            <View style={styles.fieldLeft}>
              <View style={styles.iconCircle}>
                <Tag size={16} color={colors.primary} />
              </View>
              <Text style={styles.fieldLabel}>{t ? t('category') : 'Category'}</Text>
            </View>
            <View style={styles.fieldRight}>
              {cat ? (
                <View style={styles.catSelectedBadge}>
                  <cat.Icon size={14} color={colors.text} strokeWidth={2} />
                  <Text style={styles.catSelectedText} numberOfLines={1}>
                    {sub ? `${cat.label} › ${sub.label}` : cat.label}
                  </Text>
                </View>
              ) : (
                <Text style={styles.fieldPlaceholder}>Select category</Text>
              )}
              <ChevronRight size={18} color={colors.muted} />
            </View>
          </TouchableOpacity>

          <View style={styles.fieldDivider} />

          <View style={styles.fieldRow}>
            <View style={styles.fieldLeft}>
              <View style={styles.iconCircle}>
                <FileText size={16} color={colors.primary} />
              </View>
              <Text style={styles.fieldLabel}>{t ? t('note') : 'Note'}</Text>
            </View>
            <TextInput
              style={styles.fieldInput}
              value={note}
              onChangeText={setNote}
              placeholder="Add a note..."
              placeholderTextColor={colors.muted}
              keyboardAppearance="light"
            />
          </View>
        </View>
      </ScrollView>

      {/* Save */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={save} activeOpacity={0.85}>
          <Text style={styles.saveText}>{editing ? 'Save changes' : 'Save transaction'}</Text>
        </TouchableOpacity>
      </View>

      <DatePickerModal visible={dateOpen} value={date} onSelect={setDate} onClose={() => setDateOpen(false)} />
      <CategoryPickerModal
        visible={catOpen}
        categories={categories}
        value={category}
        subValue={subcategory}
        onSelect={(catKey, subKey) => { setCategory(catKey); setSubcategory(subKey); }}
        onClose={() => setCatOpen(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
  },
  side: { width: 32, alignItems: 'center' },
  topTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  scroller: { overflowX: 'hidden' }, // web: never scroll the form sideways
  body: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 24 },

  amountCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    paddingBottom: 22,
    marginTop: 20,
    ...cardShadow,
  },
  caption: { fontSize: 15, color: colors.muted },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    ...shadow,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  dateChipText: { fontSize: 13, color: colors.muted, marginLeft: 6 },
  amountRow: { flexDirection: 'row', alignItems: 'center', marginTop: 22 },
  currency: { fontSize: 36, fontWeight: '700', color: colors.text },
  amountInput: {
    flex: 1,
    minWidth: 0, // web: inputs have a wide default width; let it shrink so the page doesn't overflow sideways
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    paddingVertical: 0,
    paddingHorizontal: 2,
    borderWidth: 0,
    outlineStyle: 'none', // web: hide the browser focus box
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  accountTrack: {
    flexDirection: 'row',
    backgroundColor: colors.elevated,
    borderRadius: 12,
    padding: 3,
  },
  accountTab: {
    flex: 1,
    height: 42,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    backgroundColor: 'transparent',
  },
  accountTabActive: {
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  accountTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.muted,
    marginLeft: 6,
  },
  accountTabTextActive: {
    color: colors.text,
    fontWeight: '600',
  },

  detailsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 2,
    marginTop: 18,
    ...cardShadow,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    minHeight: 52,
  },
  fieldLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  fieldRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginLeft: 12,
  },
  catSelectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.elevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
    maxWidth: '85%',
  },
  catSelectedText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 6,
  },
  fieldPlaceholder: {
    fontSize: 14,
    color: colors.muted,
    marginRight: 6,
  },
  fieldDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 42,
  },
  fieldInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    textAlign: 'right',
    paddingVertical: 6,
    paddingHorizontal: 6,
    marginLeft: 12,
    borderWidth: 0,
    outlineStyle: 'none',
  },

  footer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border },
  saveBtn: { backgroundColor: colors.primary, borderRadius: 8, height: 48, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: colors.onPrimary, fontSize: 16, fontWeight: '700' },
});
