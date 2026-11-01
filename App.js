import React, { useCallback, useState } from 'react';
import { SafeAreaView, View, TouchableOpacity, StyleSheet, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Plus } from 'lucide-react-native';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { TransactionsProvider } from './src/context/TransactionsContext';
import { AccountsProvider } from './src/context/AccountsContext';
import { CategoriesProvider } from './src/context/CategoriesContext';
import HomeScreen from './src/screens/HomeScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import AccountsScreen from './src/screens/AccountsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TransactionFormScreen from './src/screens/TransactionFormScreen';
import NavBar from './src/components/NavBar';
import { colors } from './src/constants/theme';
import { installWebFonts } from './src/utils/webFonts';

// Apple-style font on web (iOS already uses SF Pro natively)
installWebFonts();

export default function App() {
  return (
    <SettingsProvider>
      <TransactionsProvider>
        <AccountsProvider>
          <CategoriesProvider>
            <AppShell />
          </CategoriesProvider>
        </AccountsProvider>
      </TransactionsProvider>
    </SettingsProvider>
  );
}

// Tabs where the floating "+ transaction" button is shown (Home has its own add buttons)
const FAB_TABS = ['transactions'];

function AppShell() {
  const { settings } = useSettings();
  const [tab, setTab] = useState('home');
  // null = form closed; { editing: null, type } = new transaction; { editing: txn } = edit
  const [form, setForm] = useState(null);

  const openAdd = (type = 'expense') => setForm({ editing: null, type });
  const openEdit = (txn) => setForm({ editing: txn });
  const closeForm = useCallback(() => setForm(null), []);

  let screen;
  if (tab === 'home') screen = <HomeScreen onEdit={openEdit} onAdd={openAdd} onNavigate={setTab} />;
  else if (tab === 'transactions') screen = <TransactionsScreen onEdit={openEdit} />;
  else if (tab === 'accounts') screen = <AccountsScreen />;
  else screen = <SettingsScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      {/* Tabs stay mounted (just hidden) while the form page is open, so they keep their state */}
      <View style={[styles.shell, form && styles.hidden]}>
        {/* Keyed by currency so every amount re-renders when it changes in Settings */}
        <View style={styles.content} key={settings.currency}>
          {screen}
        </View>

        {FAB_TABS.includes(tab) && (
          <TouchableOpacity style={styles.fab} onPress={() => openAdd()} activeOpacity={0.85} accessibilityLabel="Add transaction">
            <Plus size={28} color={colors.onPrimary} strokeWidth={2.5} />
          </TouchableOpacity>
        )}

        <NavBar active={tab} onChange={setTab} />
      </View>

      {form && <TransactionFormScreen editing={form.editing} initialType={form.type} onClose={closeForm} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  shell: { flex: 1 },
  hidden: { display: 'none' },
  content: { flex: 1, backgroundColor: colors.background },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 84,
    width: 58,
    height: 58,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    zIndex: 10,
  },
});
