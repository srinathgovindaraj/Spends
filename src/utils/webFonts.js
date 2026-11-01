import { Platform } from 'react-native';

// Apple-style typography on web.
// - Apple devices: the real system font (SF Pro) via -apple-system / BlinkMacSystemFont.
// - Everywhere else: SF Pro if the user has it installed, otherwise Inter (the closest free match).
// iOS native already uses SF Pro as its system font, so nothing is needed there.
export const APPLE_FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Inter, "Segoe UI", Roboto, sans-serif';

export function installWebFonts() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  if (document.getElementById('apple-fonts')) return;

  const preconnect = document.createElement('link');
  preconnect.rel = 'preconnect';
  preconnect.href = 'https://fonts.gstatic.com';
  preconnect.crossOrigin = 'anonymous';
  document.head.appendChild(preconnect);

  const inter = document.createElement('link');
  inter.rel = 'stylesheet';
  inter.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
  document.head.appendChild(inter);

  // react-native-web gives every Text/TextInput its own font-family class, so override them all.
  // (body * rather than #root * so pop-ups, which render outside #root, are covered too.)
  const style = document.createElement('style');
  style.id = 'apple-fonts';
  style.textContent = `
    html, body, body * {
      font-family: ${APPLE_FONT_STACK} !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      font-feature-settings: "cv11", "ss01"; /* Inter: SF-like single-storey a and straight 1 */
    }
  `;
  document.head.appendChild(style);
}
