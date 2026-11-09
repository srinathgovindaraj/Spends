import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors } from '../constants/theme';
import { useThemedStyles } from '../context/SettingsContext';
import { monthLabel } from '../utils/format';

export default function MonthSwitcher({ year, month, onChange }) {
  const styles = useThemedStyles(getStyles);
  const shift = (delta) => {
    const d = new Date(year, month + delta, 1);
    onChange(d.getFullYear(), d.getMonth());
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity onPress={() => shift(-1)} style={styles.arrow} accessibilityLabel="Previous month">
        <ChevronLeft size={18} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.label}>{monthLabel(year, month)}</Text>
      <TouchableOpacity onPress={() => shift(1)} style={styles.arrow} accessibilityLabel="Next month">
        <ChevronRight size={18} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 3,
  },
  arrow: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  label: { color: colors.text, fontSize: 14, fontWeight: '600', minWidth: 84, textAlign: 'center' },
});
