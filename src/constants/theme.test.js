import test from 'node:test';
import assert from 'node:assert/strict';
import { lightColors, darkColors, colors, applyTheme, CURRENCIES, DEFAULT_CURRENCY } from './theme';

test('theme colors are properly defined', () => {
  assert.equal(darkColors.background, '#121214');
  assert.equal(darkColors.card, '#1C1C1E');
  assert.equal(darkColors.text, '#F5F5F7');
  assert.equal(lightColors.background, '#F5F5F5');
  assert.equal(lightColors.card, '#FFFFFF');
  assert.equal(lightColors.text, '#1D1D1F');
});

test('applyTheme toggles colors correctly', () => {
  const isDark = applyTheme('dark');
  assert.equal(isDark, true);
  assert.equal(colors.background, '#121214');
  assert.equal(colors.card, '#1C1C1E');

  const isLight = applyTheme('light');
  assert.equal(isLight, false);
  assert.equal(colors.background, '#F5F5F5');
  assert.equal(colors.card, '#FFFFFF');

  // Reset to dark
  applyTheme('dark');
  assert.equal(colors.background, '#121214');
});

test('currencies include default currency INR', () => {
  assert.equal(DEFAULT_CURRENCY, 'INR');
  const inr = CURRENCIES.find((c) => c.code === 'INR');
  assert.ok(inr);
  assert.equal(inr.symbol, '₹');
});
