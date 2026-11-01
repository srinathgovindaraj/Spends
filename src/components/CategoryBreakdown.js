import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, cardShadow } from '../constants/theme';
import { useCategories } from '../context/CategoriesContext';
import TypeSwitch from './TypeSwitch';
import { formatMoney } from '../utils/format';

// `transactions` should already be limited to the month being shown.
export default function CategoryBreakdown({ transactions }) {
  const [type, setType] = useState('expense');
  const { getCategory } = useCategories();

  const { rows, total } = useMemo(() => {
    const byCat = {};
    let sum = 0;
    transactions
      .filter((t) => t.type === type)
      .forEach((t) => {
        byCat[t.category] = (byCat[t.category] || 0) + t.amount;
        sum += t.amount;
      });
    const list = Object.entries(byCat)
      .map(([key, amount]) => ({ ...getCategory(key), amount }))
      .sort((a, b) => b.amount - a.amount);
    return { rows: list, total: sum };
  }, [transactions, type, getCategory]);

  return (
    <View style={styles.card}>
      <TypeSwitch value={type} onChange={setType} style={styles.switch} />

      <Text style={styles.caption}>Total {type}</Text>
      <Text style={[styles.total, { color: type === 'income' ? colors.income : colors.expense }]}>
        {formatMoney(total)}
      </Text>

      {rows.length === 0 ? (
        <Text style={styles.empty}>No {type} data for this month.</Text>
      ) : (
        rows.map((r) => {
          const pct = total ? (r.amount / total) * 100 : 0;
          return (
            <View key={r.key} style={styles.catRow}>
              <View style={styles.catTop}>
                <View style={styles.catName}>
                  <r.Icon size={16} color={colors.text} strokeWidth={1.75} />
                  <Text style={styles.catLabel}>{r.label}</Text>
                </View>
                <Text style={styles.catAmount}>
                  {formatMoney(r.amount)} <Text style={styles.pct}>({pct.toFixed(0)}%)</Text>
                </Text>
              </View>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: colors.primary }]} />
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  switch: { borderWidth: 0, padding: 0, marginBottom: 16, shadowOpacity: 0, elevation: 0 }, // sits inside this card: no second shadow
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, ...cardShadow },
  caption: { color: colors.muted, fontSize: 13, textTransform: 'capitalize' },
  total: { fontSize: 26, fontWeight: '700', marginBottom: 12 },
  empty: { color: colors.muted, textAlign: 'center', paddingVertical: 20 },
  catRow: { marginBottom: 12 },
  catTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  catName: { flexDirection: 'row', alignItems: 'center' },
  catLabel: { color: colors.text, fontSize: 14, fontWeight: '500', marginLeft: 8 },
  catAmount: { color: colors.text, fontSize: 14, fontWeight: '600' },
  pct: { color: colors.muted, fontWeight: '400' },
  barBg: { height: 6, backgroundColor: colors.elevated, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
});
