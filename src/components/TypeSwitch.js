import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { colors } from '../constants/theme';
import { useThemedStyles } from '../context/SettingsContext';

const OPTIONS = [
  { key: 'expense', label: 'Expenses', Icon: ArrowUpRight },
  { key: 'income', label: 'Income', Icon: ArrowDownLeft },
];

export default function TypeSwitch({ value, onChange, style }) {
  const styles = useThemedStyles(getStyles);
  return (
    <View style={[styles.track, style]}>
      {OPTIONS.map(({ key, label, Icon }) => {
        const active = value === key;
        return (
          <TouchableOpacity
            key={key}
            style={[styles.btn, active && styles.btnActive]}
            onPress={() => onChange(key)}
            activeOpacity={0.75}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
            <Icon
              size={15}
              color={active ? colors.text : colors.muted}
              strokeWidth={active ? 2.2 : 1.75}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.elevated,
    borderRadius: 10,
    padding: 3,
  },
  btn: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  btnActive: {
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.muted,
    marginRight: 5,
  },
  textActive: {
    color: colors.text,
    fontWeight: '600',
  },
});
