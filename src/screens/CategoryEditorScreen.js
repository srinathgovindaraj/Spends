import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, BackHandler, KeyboardAvoidingView, Platform,
} from 'react-native';
import { ChevronLeft, Plus, X, Trash2 } from 'lucide-react-native';
import { useCategories } from '../context/CategoriesContext';
import { colors, cardShadow } from '../constants/theme';
import { CATEGORY_ICONS, ICON_NAMES } from '../constants/categories';
import { confirmAction, notify } from '../utils/confirm';

// Add or edit one category and its sub-categories. category = null means "new".
export default function CategoryEditorScreen({ category, type, usedCount, onClose }) {
  const { addCategory, updateCategory, deleteCategory } = useCategories();
  const [label, setLabel] = useState(category ? category.label : '');
  const [icon, setIcon] = useState(category ? category.icon : 'Tag');
  const [subs, setSubs] = useState(category ? category.subcategories : []);
  const [newSub, setNewSub] = useState('');

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => { onClose(); return true; });
    return () => sub.remove();
  }, [onClose]);

  const catType = category ? category.type : type;

  const addSub = () => {
    const name = newSub.trim();
    if (!name) return;
    if (subs.some((s) => s.label.toLowerCase() === name.toLowerCase())) {
      notify('Already added', `"${name}" is already a sub-category.`);
      return;
    }
    setSubs((prev) => [...prev, { key: `s_${Date.now()}`, label: name }]);
    setNewSub('');
  };

  const renameSub = (key, text) => setSubs((prev) => prev.map((s) => (s.key === key ? { ...s, label: text } : s)));
  const removeSub = (key) => setSubs((prev) => prev.filter((s) => s.key !== key));

  const save = () => {
    const name = label.trim();
    if (!name) {
      notify('Name required', 'Give the category a name.');
      return;
    }
    const cleaned = subs.map((s) => ({ ...s, label: s.label.trim() })).filter((s) => s.label);
    const data = { label: name, icon, subcategories: cleaned };
    if (category) updateCategory(category.key, data);
    else addCategory({ ...data, type: catType });
    onClose();
  };

  const remove = () => {
    if (usedCount > 0) {
      notify(
        'Category in use',
        `${usedCount} transaction${usedCount === 1 ? ' uses' : 's use'} this category. Change or delete them first.`
      );
      return;
    }
    confirmAction('Delete category?', `${category.label} and its sub-categories will be removed.`, 'Delete', () => {
      deleteCategory(category.key);
      onClose();
    });
  };

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.side} onPress={onClose} hitSlop={10} accessibilityLabel="Back">
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>{category ? 'Edit category' : `New ${catType} category`}</Text>
        <View style={styles.side}>
          {category && (
            <TouchableOpacity onPress={remove} hitSlop={10} accessibilityLabel="Delete category">
              <Trash2 size={20} color={colors.expense} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {/* Name */}
        <View style={styles.card}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>NAME</Text>
            <TextInput
              style={styles.field}
              value={label}
              onChangeText={setLabel}
              placeholder="e.g. Travel"
              placeholderTextColor={colors.muted}
              autoFocus={!category}
            />
          </View>
        </View>

        {/* Icon */}
        <Text style={styles.sectionLabel}>ICON</Text>
        <View style={[styles.card, styles.iconGrid]}>
          {ICON_NAMES.map((name) => {
            const Icon = CATEGORY_ICONS[name];
            const selected = icon === name;
            return (
              <TouchableOpacity
                key={name}
                style={styles.iconCell}
                onPress={() => setIcon(name)}
                accessibilityLabel={name}
                accessibilityState={{ selected }}
              >
                <View style={[styles.iconBox, selected && styles.iconBoxActive]}>
                  <Icon size={20} color={selected ? colors.onPrimary : colors.text} strokeWidth={1.75} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sub-categories */}
        <Text style={styles.sectionLabel}>SUB-CATEGORIES</Text>
        <View style={styles.card}>
          {subs.map((s, i) => (
            <View key={s.key} style={[styles.subRow, i > 0 && styles.rowBorder]}>
              <TextInput
                style={styles.subInput}
                value={s.label}
                onChangeText={(t) => renameSub(s.key, t)}
                placeholder="Sub-category name"
                placeholderTextColor={colors.muted}
              />
              <TouchableOpacity onPress={() => removeSub(s.key)} hitSlop={10} accessibilityLabel={`Remove ${s.label}`}>
                <X size={18} color={colors.muted} />
              </TouchableOpacity>
            </View>
          ))}
          <View style={[styles.subRow, subs.length > 0 && styles.rowBorder]}>
            <TextInput
              style={styles.subInput}
              value={newSub}
              onChangeText={setNewSub}
              onSubmitEditing={addSub}
              placeholder="Add a sub-category"
              placeholderTextColor={colors.muted}
              returnKeyType="done"
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[styles.addSubBtn, !newSub.trim() && { opacity: 0.4 }]}
              onPress={addSub}
              disabled={!newSub.trim()}
              accessibilityLabel="Add sub-category"
            >
              <Plus size={18} color={colors.onPrimary} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.hint}>Sub-categories let you split a category, e.g. Food › Groceries, Dining out.</Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={save} activeOpacity={0.85}>
          <Text style={styles.saveText}>{category ? 'Save changes' : 'Add category'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
  },
  side: { width: 32, alignItems: 'center' },
  topTitle: { fontSize: 18, fontWeight: '600', color: colors.text, textTransform: 'none' },
  body: { padding: 18, paddingBottom: 30 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: colors.muted, letterSpacing: 0.5, marginTop: 24, marginBottom: 8, marginLeft: 2 },
  card: { backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6, ...cardShadow },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },

  fieldRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  fieldLabel: { width: 70, fontSize: 12, fontWeight: '700', color: colors.text, letterSpacing: 0.3 },
  field: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: '#C7C7CC',
    paddingVertical: 6,
    outlineStyle: 'none',
  },

  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 6, paddingVertical: 8 },
  iconCell: { width: `${100 / 6}%`, alignItems: 'center', paddingVertical: 5 },
  iconBox: { width: 42, height: 42, borderRadius: 8, backgroundColor: colors.elevated, alignItems: 'center', justifyContent: 'center' },
  iconBoxActive: { backgroundColor: colors.primary },

  subRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  subInput: { flex: 1, minWidth: 0, fontSize: 15, color: colors.text, paddingVertical: 6, marginRight: 10, outlineStyle: 'none' },
  addSubBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  hint: { fontSize: 12, color: colors.muted, marginTop: 8, marginLeft: 2 },

  footer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14, backgroundColor: colors.card },
  saveBtn: { backgroundColor: colors.primary, borderRadius: 8, height: 52, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: colors.onPrimary, fontSize: 16, fontWeight: '700' },
});
