import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, cardShadow } from '../constants/theme';
import { txnAccountId } from '../constants/accounts';
import { useAccounts } from '../context/AccountsContext';
import { useCategories } from '../context/CategoriesContext';
import IconBadge from './IconBadge';
import { formatMoney, formatDate } from '../utils/format';

export default function TransactionItem({ item, onPress, onLongPress }) {
  const { getCategory, getSubcategory } = useCategories();
  const cat = getCategory(item.category);
  const sub = item.subcategory ? getSubcategory(item.category, item.subcategory) : null;
  const catText = sub ? `${cat.label} › ${sub.label}` : cat.label;
  const account = useAccounts().getAccount(txnAccountId(item));
  const isIncome = item.type === 'income';

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} onLongPress={onLongPress} activeOpacity={0.7}>
      <IconBadge Icon={cat.Icon} />
      <View style={styles.middle}>
        <Text style={styles.title} numberOfLines={1}>{item.note || sub?.label || cat.label}</Text>
        <Text style={styles.sub} numberOfLines={1}>{catText} · {account.name} · {formatDate(item.date)}</Text>
      </View>
      <Text style={[styles.amount, { color: isIncome ? colors.income : colors.expense }]}>
        {isIncome ? '+' : '-'}{formatMoney(item.amount)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
    ...cardShadow,
  },
  middle: { flex: 1, marginHorizontal: 12 },
  title: { fontSize: 15, fontWeight: '600', color: colors.text },
  sub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  amount: { fontSize: 15, fontWeight: '700' },
});
