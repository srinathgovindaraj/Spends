import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, cardShadow } from '../constants/theme';
import { isSameMonth } from '../utils/format';

// Income vs expense for the 6 months ending at year/month.
export default function TrendChart({ transactions, year, month }) {
  const trend = useMemo(() => {
    const out = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(year, month - i, 1);
      let inc = 0;
      let exp = 0;
      transactions.forEach((t) => {
        if (isSameMonth(t.date, d.getFullYear(), d.getMonth())) {
          if (t.type === 'income') inc += t.amount;
          else exp += t.amount;
        }
      });
      out.push({ label: d.toLocaleString('en', { month: 'short' }), inc, exp });
    }
    return out;
  }, [transactions, year, month]);
  const maxTrend = Math.max(1, ...trend.map((t) => Math.max(t.inc, t.exp)));

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Last 6 months</Text>
      <View style={styles.chart}>
        {trend.map((t, i) => (
          <View key={i} style={styles.chartCol}>
            <View style={styles.bars}>
              <View style={[styles.vbar, { height: (t.inc / maxTrend) * 120, backgroundColor: colors.income }]} />
              <View style={[styles.vbar, { height: (t.exp / maxTrend) * 120, backgroundColor: colors.expense }]} />
            </View>
            <Text style={styles.chartLabel}>{t.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        <View style={[styles.dot, { backgroundColor: colors.income }]} />
        <Text style={styles.legendText}>Income</Text>
        <View style={[styles.dot, { backgroundColor: colors.expense, marginLeft: 16 }]} />
        <Text style={styles.legendText}>Expense</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, ...cardShadow },
  cardTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 12 },
  chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 145 },
  chartCol: { alignItems: 'center', flex: 1 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: 120 },
  vbar: { width: 10, borderRadius: 3, marginHorizontal: 1, minHeight: 2 },
  chartLabel: { fontSize: 11, color: colors.muted, marginTop: 6 },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { color: colors.muted, fontSize: 12 },
});
