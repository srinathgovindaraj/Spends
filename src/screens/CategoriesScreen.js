import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, BackHandler } from 'react-native';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import { useCategories } from '../context/CategoriesContext';
import { useTransactions } from '../context/TransactionsContext';
import { useThemedStyles } from '../context/SettingsContext';
import { colors, cardShadow } from '../constants/theme';
import IconBadge from '../components/IconBadge';
import CategoryEditorScreen from './CategoryEditorScreen';

// Settings › Expense categories / Income categories. `type` is 'expense' or 'income'.
export default function CategoriesScreen({ type, onBack }) {
  const styles = useThemedStyles(getStyles);
  const { byType } = useCategories();
  const { transactions } = useTransactions();
  const [editor, setEditor] = useState(null); // null | { category } (category null = new)

  useEffect(() => {
    if (editor) return undefined; // the editor handles back itself
    const sub = BackHandler.addEventListener('hardwareBackPress', () => { onBack(); return true; });
    return () => sub.remove();
  }, [editor, onBack]);

  const counts = useMemo(() => {
    const c = {};
    transactions.forEach((t) => { c[t.category] = (c[t.category] || 0) + 1; });
    return c;
  }, [transactions]);

  if (editor) {
    return (
      <CategoryEditorScreen
        category={editor.category}
        type={type}
        usedCount={editor.category ? counts[editor.category.key] || 0 : 0}
        onClose={() => setEditor(null)}
      />
    );
  }

  const list = byType(type);

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.side} onPress={onBack} hitSlop={10} accessibilityLabel="Back">
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>{type === 'expense' ? 'Expense categories' : 'Income categories'}</Text>
        <View style={styles.side} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={[styles.sectionLabel, { marginTop: 0 }]}>
          {list.length} {list.length === 1 ? 'CATEGORY' : 'CATEGORIES'}
        </Text>
        <View style={styles.card}>
          {list.map((c, i) => {
            const n = c.subcategories.length;
            return (
              <TouchableOpacity
                key={c.key}
                style={[styles.row, i > 0 && styles.rowBorder]}
                onPress={() => setEditor({ category: c })}
              >
                <IconBadge Icon={c.Icon} size={38} />
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle} numberOfLines={1}>{c.label}</Text>
                  <Text style={styles.rowSub} numberOfLines={1}>
                    {n ? c.subcategories.map((s) => s.label).join(', ') : 'No sub-categories'}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.muted} />
              </TouchableOpacity>
            );
          })}
          {list.length === 0 && <Text style={styles.empty}>No categories yet.</Text>}
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={() => setEditor({ category: null })}>
          <Plus size={18} color={colors.primary} />
          <Text style={styles.addText}>Add {type} category</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  side: { width: 32, alignItems: 'center' },
  topTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  body: { padding: 18, paddingBottom: 40 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: colors.muted, letterSpacing: 0.5, marginTop: 24, marginBottom: 8, marginLeft: 2 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 14, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  rowText: { flex: 1, marginHorizontal: 12 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  rowSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  empty: { color: colors.muted, textAlign: 'center', paddingVertical: 20 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    marginTop: 16,
  },
  addText: { color: colors.primary, fontSize: 15, fontWeight: '600', marginLeft: 6 },
});
