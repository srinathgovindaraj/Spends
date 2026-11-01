import {
  Utensils, Coffee, ShoppingCart, ShoppingBag, Shirt, Bus, Car, Fuel, Plane, House,
  Lightbulb, Wifi, Smartphone, HeartPulse, Dumbbell, GraduationCap, Clapperboard, Gamepad2,
  Music, Gift, PawPrint, Baby, Package, Wrench, Briefcase, Laptop, Coins, PiggyBank,
  TrendingUp, Banknote, Receipt, Landmark, Tag, CircleHelp,
} from 'lucide-react-native';

// Icons a category can use. Categories store the icon's *name* (so they can be saved),
// and the app looks the component up here.
export const CATEGORY_ICONS = {
  Utensils, Coffee, ShoppingCart, ShoppingBag, Shirt, Bus, Car, Fuel, Plane, House,
  Lightbulb, Wifi, Smartphone, HeartPulse, Dumbbell, GraduationCap, Clapperboard, Gamepad2,
  Music, Gift, PawPrint, Baby, Package, Wrench, Briefcase, Laptop, Coins, PiggyBank,
  TrendingUp, Banknote, Receipt, Landmark, Tag,
};
export const ICON_NAMES = Object.keys(CATEGORY_ICONS);

export function resolveIcon(name) {
  return CATEGORY_ICONS[name] || CircleHelp;
}

const sub = (key, label) => ({ key, label });

// Starting categories. Keys match transactions saved by earlier versions of the app.
export const DEFAULT_CATEGORIES = [
  { key: 'food', type: 'expense', label: 'Food', icon: 'Utensils',
    subcategories: [sub('food_groceries', 'Groceries'), sub('food_dining', 'Dining out'), sub('food_snacks', 'Snacks')] },
  { key: 'transport', type: 'expense', label: 'Transport', icon: 'Bus',
    subcategories: [sub('transport_fuel', 'Fuel'), sub('transport_public', 'Public transport'), sub('transport_taxi', 'Taxi')] },
  { key: 'shopping', type: 'expense', label: 'Shopping', icon: 'ShoppingBag',
    subcategories: [sub('shopping_clothes', 'Clothes'), sub('shopping_electronics', 'Electronics')] },
  { key: 'bills', type: 'expense', label: 'Bills', icon: 'Lightbulb',
    subcategories: [sub('bills_rent', 'Rent'), sub('bills_electricity', 'Electricity'), sub('bills_internet', 'Internet'), sub('bills_phone', 'Phone')] },
  { key: 'health', type: 'expense', label: 'Health', icon: 'HeartPulse',
    subcategories: [sub('health_medicine', 'Medicine'), sub('health_doctor', 'Doctor')] },
  { key: 'entertainment', type: 'expense', label: 'Fun', icon: 'Clapperboard',
    subcategories: [sub('fun_movies', 'Movies'), sub('fun_subscriptions', 'Subscriptions')] },
  { key: 'other_exp', type: 'expense', label: 'Other', icon: 'Package', subcategories: [] },

  { key: 'salary', type: 'income', label: 'Salary', icon: 'Briefcase',
    subcategories: [sub('salary_monthly', 'Monthly pay'), sub('salary_bonus', 'Bonus')] },
  { key: 'freelance', type: 'income', label: 'Freelance', icon: 'Laptop', subcategories: [] },
  { key: 'gift', type: 'income', label: 'Gift', icon: 'Gift', subcategories: [] },
  { key: 'other_inc', type: 'income', label: 'Other', icon: 'Coins', subcategories: [] },
];
