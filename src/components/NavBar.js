import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { House, ReceiptText, Wallet, Settings } from 'lucide-react-native';
import { colors } from '../constants/theme';

import { useSettings } from '../context/SettingsContext';

export const TABS = [
  { key: 'home', labelKey: 'home', label: 'Home', Icon: House },
  { key: 'transactions', labelKey: 'transactions', label: 'Transactions', Icon: ReceiptText },
  { key: 'accounts', labelKey: 'accounts', label: 'Accounts', Icon: Wallet },
  { key: 'settings', labelKey: 'settings', label: 'Settings', Icon: Settings },
];

export default function NavBar({ active, onChange }) {
  const { t } = useSettings();
  return (
    <View style={styles.bar} accessibilityRole="tablist">
      {TABS.map(({ key, labelKey, label, Icon }) => {
        const isActive = key === active;
        const tint = isActive ? colors.primary : colors.muted;
        const tabText = t ? t(labelKey, label) : label;
        return (
          <TouchableOpacity
            key={key}
            style={styles.item}
            onPress={() => onChange(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tabText}
            activeOpacity={0.7}
          >
            <View style={styles.pill}>
              <Icon size={22} color={tint} strokeWidth={isActive ? 2.25 : 1.75} />
            </View>
            <Text style={[styles.label, { color: tint }, isActive && styles.labelActive]} numberOfLines={1}>
              {tabText}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingBottom: 10,
  },
  item: { flex: 1, alignItems: 'center' },
  pill: { paddingHorizontal: 18, paddingVertical: 4, borderRadius: 8 },
  label: { fontSize: 11, marginTop: 3, fontWeight: '500' },
  labelActive: { fontWeight: '700' },
});
