import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors } from '../constants/theme';
import { useThemedStyles } from '../context/SettingsContext';
import { monthLabel } from '../utils/format';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Small month calendar. `value` is a Date; onSelect receives a Date at noon.
export default function DatePickerModal({ visible, value, onSelect, onClose }) {
  const styles = useThemedStyles(getStyles);
  const [view, setView] = useState({ y: value.getFullYear(), m: value.getMonth() });

  useEffect(() => {
    if (visible) setView({ y: value.getFullYear(), m: value.getMonth() });
  }, [visible, value]);

  const shift = (delta) => {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  const firstWeekday = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const today = new Date();

  const pickToday = () => {
    const t = new Date();
    t.setHours(12, 0, 0, 0);
    onSelect(t);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.nav} onPress={() => shift(-1)} accessibilityLabel="Previous month">
              <ChevronLeft size={18} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>{monthLabel(view.y, view.m)}</Text>
            <TouchableOpacity style={styles.nav} onPress={() => shift(1)} accessibilityLabel="Next month">
              <ChevronRight size={18} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {WEEKDAYS.map((w, i) => (
              <Text key={`w${i}`} style={styles.weekday}>{w}</Text>
            ))}
            {cells.map((day, i) => {
              if (!day) return <View key={`b${i}`} style={styles.cell} />;
              const d = new Date(view.y, view.m, day, 12);
              const selected = sameDay(d, value);
              const isToday = sameDay(d, today);
              return (
                <TouchableOpacity key={day} style={styles.cell} onPress={() => { onSelect(d); onClose(); }}>
                  <View style={[styles.day, isToday && styles.today, selected && styles.selected]}>
                    <Text style={[styles.dayText, selected && styles.selectedText]}>{day}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.todayBtn} onPress={pickToday}>
            <Text style={styles.todayBtnText}>Today</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const getStyles = (colors) => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  sheet: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  nav: { width: 34, height: 34, borderRadius: 8, backgroundColor: colors.elevated, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { width: `${100 / 7}%`, textAlign: 'center', fontSize: 12, color: colors.muted, paddingVertical: 6 },
  cell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 3 },
  day: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  today: { borderWidth: 1, borderColor: colors.primary },
  selected: { backgroundColor: colors.primary, borderWidth: 0 },
  dayText: { fontSize: 14, color: colors.text },
  selectedText: { color: colors.onPrimary, fontWeight: '700' },
  todayBtn: { marginTop: 10, height: 40, borderRadius: 8, backgroundColor: colors.elevated, alignItems: 'center', justifyContent: 'center' },
  todayBtnText: { fontSize: 14, fontWeight: '600', color: colors.primary },
});
