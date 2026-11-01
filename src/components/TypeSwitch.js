import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { colors, cardShadow } from '../constants/theme';

const OPTIONS = [
  { key: 'expense', label: 'Expenses', Icon: ArrowUpRight },
  { key: 'income', label: 'Income', Icon: ArrowDownLeft },
];

// White card holding the "Expenses ↗" / "Income ↙" buttons. The `value` button is filled blue.
export default function TypeSwitch({ value, onChange, style }) {
  return (
    <View style={[styles.card, style]}>
      {OPTIONS.map(({ key, label, Icon }, i) => {
        const active = value === key;
        return (
          <TouchableOpacity
            key={key}
            style={[styles.btn, i === 0 && styles.gap, active ? styles.btnActive : styles.btnIdle]}
            onPress={() => onChange(key)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
            <Icon size={16} color={active ? colors.onPrimary : colors.text} strokeWidth={2.25} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    ...cardShadow,
  },
  btn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gap: { marginRight: 28 },
  btnActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  btnIdle: { backgroundColor: colors.card, borderWidth: 1, borderColor: '#C7C7CC' },
  text: { fontSize: 14, fontWeight: '500', color: colors.text, marginRight: 4 },
  textActive: { color: colors.onPrimary, fontWeight: '700' },
});
