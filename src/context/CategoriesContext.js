import React, { createContext, useContext, useMemo } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import { DEFAULT_CATEGORIES, resolveIcon } from '../constants/categories';

const CategoriesContext = createContext(null);

const UNKNOWN = { key: '?', type: 'expense', label: 'Unknown', icon: null, subcategories: [] };

export function CategoriesProvider({ children }) {
  const [categories, setCategories, loaded] = usePersistentState('@money_manager/categories', () => DEFAULT_CATEGORIES);

  const value = useMemo(() => {
    // Attach the icon component so screens can render <cat.Icon />
    const withIcon = (c) => ({ ...c, Icon: resolveIcon(c.icon) });

    return {
      loaded,
      categories,
      byType: (type) => categories.filter((c) => c.type === type).map(withIcon),
      getCategory: (key) => withIcon(categories.find((c) => c.key === key) || { ...UNKNOWN, key }),
      getSubcategory: (catKey, subKey) =>
        categories.find((c) => c.key === catKey)?.subcategories.find((s) => s.key === subKey) || null,
      addCategory: (c) =>
        setCategories((prev) => [...prev, { ...c, key: `c_${Date.now()}` }]),
      updateCategory: (key, changes) =>
        setCategories((prev) => prev.map((c) => (c.key === key ? { ...c, ...changes } : c))),
      deleteCategory: (key) => setCategories((prev) => prev.filter((c) => c.key !== key)),
      resetCategories: () => setCategories(DEFAULT_CATEGORIES),
    };
  }, [categories, loaded, setCategories]);

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

export function useCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) throw new Error('useCategories must be used inside CategoriesProvider');
  return ctx;
}
