import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, BackHandler,
} from 'react-native';
import { ChevronLeft, ChevronDown, Trash2 } from 'lucide-react-native';
import { useTransactions } from '../context/TransactionsContext';
import { useAccounts } from '../context/AccountsContext';
import { useCategories } from '../context/CategoriesContext';
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
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.accountCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {accounts.map((a) => {
              const t = getAccountType(a.type);
              const selected = account === a.id;
              return (
                <TouchableOpacity
                  key={a.id}
                  style={[styles.chip, selected && styles.chipActive]}
                  onPress={() => setAccount(a.id)}
                >
                  <t.Icon size={16} color={selected ? colors.onPrimary : colors.text} strokeWidth={1.75} />
                  <Text style={[styles.chipText, selected && styles.chipTextActive]}>{a.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Category + note */}
        <View style={styles.detailsCard}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>CATEGORY</Text>
            <TouchableOpacity style={styles.field} onPress={() => setCatOpen(true)}>
              {cat ? (
                <View style={styles.catValue}>
                  <cat.Icon size={14} color={colors.text} strokeWidth={1.75} />
                  <Text style={styles.fieldText}>{sub ? `${cat.label} › ${sub.label}` : cat.label}</Text>
                </View>
              ) : (
                <Text style={styles.fieldPlaceholder}>Select category</Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={[styles.fieldRow, { marginTop: 14 }]}>
            <Text style={styles.fieldLabel}>NOTE</Text>
            <TextInput
              style={[styles.field, styles.fieldInput]}
              value={note}
              onChangeText={setNote}
              placeholder="Add a note"
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

  sectionLabel: { fontSize: 12, fontWeight: '700', color: colors.muted, letterSpacing: 0.5, marginTop: 30, marginBottom: 8, marginLeft: 2 },
  accountCard: { backgroundColor: colors.card, borderRadius: 10, padding: 10, ...cardShadow },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: colors.elevated,
    marginRight: 8,
  },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontSize: 14, color: colors.text, marginLeft: 8 },
  chipTextActive: { color: colors.onPrimary, fontWeight: '600' },

  detailsCard: { backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 16, marginTop: 40, ...cardShadow },
  fieldRow: { flexDirection: 'row', alignItems: 'center' },
  fieldLabel: { width: 90, fontSize: 12, fontWeight: '700', color: colors.text, letterSpacing: 0.3 },
  field: { flex: 1, minWidth: 0, borderBottomWidth: 1, borderBottomColor: '#C7C7CC', paddingVertical: 6 },
  fieldInput: { fontSize: 12, color: colors.text, borderWidth: 0, borderBottomWidth: 1, outlineStyle: 'none' },
  fieldPlaceholder: { fontSize: 12, color: colors.muted },
  fieldText: { fontSize: 12, color: colors.text, marginLeft: 6 },
  catValue: { flexDirection: 'row', alignItems: 'center' },

  footer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14, backgroundColor: colors.card },
  saveBtn: { backgroundColor: colors.primary, borderRadius: 8, height: 52, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: colors.onPrimary, fontSize: 16, fontWeight: '700' },
});
