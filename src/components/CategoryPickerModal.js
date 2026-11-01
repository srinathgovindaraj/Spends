import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable, StyleSheet, ScrollView } from 'react-native';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react-native';
import { colors } from '../constants/theme';

// Bottom sheet: pick a category, then (if it has any) one of its sub-categories.
// onSelect(categoryKey, subcategoryKey | null)
export default function CategoryPickerModal({ visible, categories, value, subValue, onSelect, onClose }) {
  const [open, setOpen] = useState(null); // category whose sub-categories are showing

  useEffect(() => {
    if (visible) setOpen(null);
  }, [visible]);

  const pickCategory = (c) => {
    if (c.subcategories.length) {
      setOpen(c);
    } else {
      onSelect(c.key, null);
      onClose();
    }
  };

  const pickSub = (subKey) => {
    onSelect(open.key, subKey);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.header}>
            {open ? (
              <TouchableOpacity style={styles.headerBack} onPress={() => setOpen(null)} hitSlop={10}>
                <ChevronLeft size={22} color={colors.text} />
                <Text style={styles.title}>{open.label}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.title}>Select category</Text>
            )}
            <TouchableOpacity onPress={onClose} hitSlop={10} accessibilityLabel="Close">
              <X size={22} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {!open ? (
            <ScrollView style={styles.scroll}>
              <View style={styles.grid}>
                {categories.map((c) => {
                  const selected = value === c.key;
                  return (
                    <TouchableOpacity key={c.key} style={styles.cell} onPress={() => pickCategory(c)}>
                      <View style={[styles.icon, selected && styles.iconActive]}>
                        <c.Icon size={22} color={selected ? colors.onPrimary : colors.text} strokeWidth={1.75} />
                      </View>
                      <Text style={[styles.label, selected && styles.labelActive]} numberOfLines={1}>{c.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          ) : (
            <ScrollView style={styles.scroll}>
              <SubRow
                label={`All ${open.label}`}
                hint="No sub-category"
                selected={value === open.key && !subValue}
                onPress={() => pickSub(null)}
              />
              {open.subcategories.map((s) => (
                <SubRow
                  key={s.key}
                  label={s.label}
                  selected={value === open.key && subValue === s.key}
                  onPress={() => pickSub(s.key)}
                />
              ))}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SubRow({ label, hint, selected, onPress }) {
  return (
    <TouchableOpacity style={styles.subRow} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.subLabel, selected && { color: colors.primary, fontWeight: '600' }]}>{label}</Text>
        {hint ? <Text style={styles.subHint}>{hint}</Text> : null}
      </View>
      {selected ? <Check size={18} color={colors.primary} strokeWidth={2.5} /> : <ChevronRight size={18} color={colors.muted} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    maxHeight: '75%',
  },
  scroll: { flexGrow: 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  headerBack: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '700', color: colors.text, marginLeft: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '25%', alignItems: 'center', paddingVertical: 10 },
  icon: { width: 52, height: 52, borderRadius: 8, backgroundColor: colors.elevated, alignItems: 'center', justifyContent: 'center' },
  iconActive: { backgroundColor: colors.primary },
  label: { fontSize: 12, color: colors.muted, marginTop: 6 },
  labelActive: { color: colors.text, fontWeight: '600' },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  subLabel: { fontSize: 15, color: colors.text },
  subHint: { fontSize: 12, color: colors.muted, marginTop: 2 },
});
