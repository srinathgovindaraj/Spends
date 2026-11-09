import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, cardShadow } from '../constants/theme';
import { formatMoney } from '../utils/format';
import { useThemedStyles } from '../context/SettingsContext';

export default function SummaryCard({ income, expense }) {
  const styles = useThemedStyles(getStyles);
  const balance = income - expense;
  return (
    <View style={styles.card}>
      <Text style={styles.caption}>Balance</Text>
      <Text style={[styles.balance, { color: balance >= 0 ? colors.text : colors.expense }]}>
        {formatMoney(balance)}
      </Text>
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.caption}>Income</Text>
          <Text style={[styles.value, { color: colors.income }]}>{formatMoney(income)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.col}>
          <Text style={styles.caption}>Expense</Text>
          <Text style={[styles.value, { color: colors.expense }]}>{formatMoney(expense)}</Text>
        </View>
      </View>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 18,
    ...cardShadow,
  },
  caption: { color: colors.muted, fontSize: 13 },
  balance: { fontSize: 32, fontWeight: '700', letterSpacing: -0.5, marginTop: 2, marginBottom: 14 },
  row: { flexDirection: 'row' },
  col: { flex: 1 },
  divider: { width: 1, backgroundColor: colors.border, marginHorizontal: 12 },
  value: { fontSize: 17, fontWeight: '600', marginTop: 2 },
});
