import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useAccounts } from '../context/AccountsContext';
import { useTransactions } from '../context/TransactionsContext';
import { colors, cardShadow } from '../constants/theme';
import { accountBalances, getAccountType, txnAccountId } from '../constants/accounts';
import { formatMoney } from '../utils/format';
import AccountModal from './AccountModal';
import IconBadge from '../components/IconBadge';
import { Plus } from 'lucide-react-native';

export default function AccountsScreen() {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);

  const balances = useMemo(() => accountBalances(accounts, transactions), [accounts, transactions]);
  const counts = useMemo(() => {
    const c = {};
    transactions.forEach((t) => { const id = txnAccountId(t); c[id] = (c[id] || 0) + 1; });
    return c;
  }, [transactions]);
  const netWorth = accounts.reduce((sum, a) => sum + balances[a.id], 0);

  const open = (account) => {
    setEditing(account);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Accounts</Text>
        <Text style={styles.netCaption}>Net worth</Text>
        <Text style={styles.netValue}>{formatMoney(netWorth)}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {accounts.map((a) => {
          const type = getAccountType(a.type);
          const bal = balances[a.id];
          const n = counts[a.id] || 0;
          return (
            <TouchableOpacity key={a.id} style={styles.row} onPress={() => open(a)} activeOpacity={0.7}>
              <IconBadge Icon={type.Icon} size={44} />
              <View style={styles.middle}>
                <Text style={styles.name} numberOfLines={1}>{a.name}</Text>
                <Text style={styles.sub}>{type.label} · {n} transaction{n === 1 ? '' : 's'}</Text>
              </View>
              <Text style={[styles.balance, bal < 0 && { color: colors.expense }]}>{formatMoney(bal)}</Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.addBtn} onPress={() => open(null)}>
          <Plus size={18} color={colors.text} />
          <Text style={styles.addText}>Add account</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>Tap an account to edit it</Text>
      </ScrollView>

      <AccountModal visible={modalVisible} editing={editing} onClose={() => setModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.5, marginBottom: 16 },
  netCaption: { color: colors.muted, fontSize: 13 },
  netValue: { color: colors.text, fontSize: 36, fontWeight: '700', letterSpacing: -0.5, marginTop: 2 },
  body: { paddingHorizontal: 16, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
    ...cardShadow,
  },
  middle: { flex: 1, marginHorizontal: 12 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  sub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  balance: { fontSize: 15, fontWeight: '700', color: colors.text },
  addBtn: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#C7C7CC',
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  addText: { color: colors.text, fontWeight: '600', fontSize: 15, marginLeft: 6 },
  hint: { textAlign: 'center', color: colors.muted, fontSize: 12, marginTop: 12 },
});
