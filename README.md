# Spends (React Native / Expo)

A simple personal finance tracker: add income and expenses, browse them by month, and see where your money goes.

## Features
- Add, edit and delete income/expense transactions
- Categories with icons and colours
- Monthly balance, income and expense summary
- Filter by All / Income / Expense
- Bottom navbar: Home · Transactions · Accounts · Settings
- Home dashboard: monthly summary, account balances, category breakdown, 6‑month chart, recent transactions
- Accounts (Cash, Bank, Card, …) with opening balances and live balances / net worth
- Settings: currency picker, export data as JSON, clear all data
- Data saved on the device with AsyncStorage (sample data loads on first run)

## Run it
```bash
npm install
npx expo install --fix   # aligns package versions with your Expo SDK
npx expo start
```
Then scan the QR code with the **Expo Go** app (Android/iOS), or press `a` for an Android emulator / `i` for the iOS simulator.

## Project structure
```
App.js                         Providers, navbar tabs, + button, modal wiring
src/
  constants/theme.js           Colours & selectable currencies
  constants/categories.js      Income / expense categories
  constants/accounts.js        Account types, default accounts, balance helper
  context/                     Transactions, Accounts, Settings state (AsyncStorage)
  hooks/usePersistentState.js  useState backed by AsyncStorage
  screens/HomeScreen.js        Dashboard
  screens/TransactionsScreen.js  Monthly list with filters
  screens/AccountsScreen.js    Accounts & net worth (+ AccountModal.js)
  screens/SettingsScreen.js    Currency, export, clear data
  screens/TransactionFormScreen.js  Full-page add / edit form
  components/                  NavBar, MonthSwitcher, SummaryCard, TransactionItem, charts
  utils/                       Money & date helpers, confirm dialogs
```

## Customise
- Currency: pick one in **Settings**; add more options to `CURRENCIES` in `src/constants/theme.js`.
- Categories: edit `src/constants/categories.js`.
- Usage: tap a transaction to edit it, long‑press to delete.
