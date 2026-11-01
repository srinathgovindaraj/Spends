import React, { useEffect, useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAccounts } from '../context/AccountsContext';
import { useTransactions } from '../context/TransactionsContext';
import { colors } from '../constants/theme';
import { ACCOUNT_TYPES, txnAccountId } from '../constants/accounts';
import { getCurrencySymbol } from '../utils/format';
import { confirmAction, notify } from '../utils/confirm';
import { X } from 'lucide-react-native';

export default function AccountModal({ visible, editing, onClose }) {
  const { accounts, addAccount, updateAccount, deleteAccount } = useAccounts();
  const { transactions } = useTransactions();
  const [name, setName] = useState('');
  const [type, setType] = useState(ACCOUNT_TYPES[0].key);
  const [opening, setOpening] = useState('');

  useEffect(() => {
    if (!visible) return;
    setName(editing ? editing.name : '');
    setType(editing ? editing.type : ACCOUNT_TYPES[0].key);
    setOpening(editing && editing.openingBalance ? String(editing.openingBalance) : '');
  }, [visible, editing]);

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      notify('Name required', 'Give the account a name.');
      return;
    }
    const value = opening.trim() === '' ? 0 : parseFloat(opening.replace(',', '.'));
    if (Number.isNaN(value)) {
      notify('Invalid balance', 'Opening balance must be a number.');
      return;
    }
    const data = { name: trimmed, type, openingBalance: Math.round(value * 100) / 100 };
    if (editing) updateAccount(editing.id, data);
    else addAccount(data);
    onClose();
  };

  const remove = () => {
    const used = transactions.filter((t) => txnAccountId(t) === editing.id).length;
    if (used > 0) {
      notify('Account in use', `${used} transaction${used === 1 ? ' uses' : 's use'} this account. Move or delete them first.`);
      return;
    }
    if (accounts.length <= 1) {
      notify('Cannot delete', 'You need at least one account.');
      return;
    }
    confirmAction('Delete account?', editing.name, 'Delete', () => {
      deleteAccount(editing.id);
      onClose();
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{editing ? 'Edit account' : 'New account'}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10} accessibilityLabel="Close">
              <X size={22} color={colors.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. HDFC Savings"
              placeholderTextColor={colors.muted}
                keyboardAppearance="light"
            />

            <Text style={styles.label}>Type</Text>
            <View style={styles.grid}>
              {ACCOUNT_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.typeBtn, type === t.key && { borderColor: colors.primary, backgroundColor: colors.primaryLight }]}
                  onPress={() => setType(t.key)}
                >
                  <t.Icon size={22} color={type === t.key ? colors.primary : colors.muted} strokeWidth={1.75} />
                  <Text style={styles.typeLabel}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Opening balance ({getCurrencySymbol()})</Text>
            <TextInput
              style={styles.input}
              value={opening}
              onChangeText={setOpening}
              keyboardType="numbers-and-punctuation"
              placeholder="0.00  (negative for card debt)"
              placeholderTextColor={colors.muted}
                keyboardAppearance="light"
            />

            <TouchableOpacity style={styles.saveBtn} onPress={save}>
              <Text style={styles.saveText}>{editing ? 'Save changes' : 'Add account'}</Text>
            </TouchableOpacity>

            {editing && (
              <TouchableOpacity style={styles.deleteBtn} onPress={remove}>
                <Text style={styles.deleteText}>Delete account</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    maxHeight: '90%',
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  label: { fontSize: 13, color: colors.muted, marginTop: 16, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  typeBtn: {
    width: '18%',
    margin: '1%',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  typeLabel: { fontSize: 11, color: colors.text, marginTop: 6 },
  saveBtn: { backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  saveText: { color: colors.onPrimary, fontSize: 16, fontWeight: '700' },
  deleteBtn: { paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  deleteText: { color: colors.expense, fontSize: 15, fontWeight: '600' },
});
