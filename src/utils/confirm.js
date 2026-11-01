import { Alert, Platform } from 'react-native';

// In an iframe / web sandbox, window.alert and window.confirm are blocked.
// Provide a lightweight in-page dialog modal on web.
function showWebDialog({ title, message, confirmText = 'OK', cancelText = null, onConfirm, onCancel }) {
  if (typeof document === 'undefined') return;

  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999999;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;
  `;

  const box = document.createElement('div');
  box.style.cssText = `
    background: #ffffff;
    border-radius: 16px;
    padding: 24px;
    max-width: 360px;
    width: 100%;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  `;

  const titleEl = document.createElement('h3');
  titleEl.textContent = title;
  titleEl.style.cssText = 'margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #111827;';

  const msgEl = document.createElement('p');
  msgEl.textContent = message;
  msgEl.style.cssText = 'margin: 0 0 20px 0; font-size: 14px; color: #4B5563; line-height: 1.5;';

  const btnContainer = document.createElement('div');
  btnContainer.style.cssText = 'display: flex; justify-content: flex-end; gap: 10px;';

  const cleanup = () => {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
  };

  if (cancelText) {
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = cancelText;
    cancelBtn.style.cssText = `
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid #E5E7EB;
      background: #F9FAFB;
      color: #374151;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    `;
    cancelBtn.onclick = () => {
      cleanup();
      if (onCancel) onCancel();
    };
    btnContainer.appendChild(cancelBtn);
  }

  const okBtn = document.createElement('button');
  okBtn.textContent = confirmText;
  const isDestructive = confirmText.toLowerCase().includes('delete') || confirmText.toLowerCase().includes('clear');
  okBtn.style.cssText = `
    padding: 8px 16px;
    border-radius: 8px;
    border: none;
    background: ${isDestructive ? '#EF4444' : '#017BFE'};
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  `;
  okBtn.onclick = () => {
    cleanup();
    if (onConfirm) onConfirm();
  };
  btnContainer.appendChild(okBtn);

  box.appendChild(titleEl);
  box.appendChild(msgEl);
  box.appendChild(btnContainer);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

export function confirmAction(title, message, confirmText, onConfirm) {
  if (Platform.OS === 'web') {
    try {
      showWebDialog({
        title,
        message,
        confirmText,
        cancelText: 'Cancel',
        onConfirm,
      });
    } catch {
      if (typeof window !== 'undefined' && window.confirm && window.confirm(`${title}\n\n${message}`)) {
        onConfirm();
      }
    }
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmText, style: 'destructive', onPress: onConfirm },
  ]);
}

export function notify(title, message) {
  if (Platform.OS === 'web') {
    try {
      showWebDialog({
        title,
        message,
        confirmText: 'OK',
      });
    } catch {
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(`${title}\n\n${message}`);
      }
    }
  } else {
    Alert.alert(title, message);
  }
}
