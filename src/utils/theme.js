// Theme system: light default, persisted in localStorage under "ri-theme".
import { t } from '../i18n/index.js';
const THEME_KEY = 'ri-theme';
const LIGHT_META = '#FAF7F2';
const DARK_META = '#141312';

function readTheme() {
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch (err) {
    // Storage unavailable (private mode); fall through to default.
  }
  return 'light';
}

function syncToggle(theme) {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const dark = theme === 'dark';
  btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
  btn.setAttribute('aria-label', dark ? t('theme.toLight') : t('theme.toDark'));
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? DARK_META : LIGHT_META);
  syncToggle(theme);
  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}

export function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  try {
    window.localStorage.setItem(THEME_KEY, next);
  } catch (err) {
    // Storage unavailable; theme still applies for this visit.
  }
  applyTheme(next);
  return next;
}

export function initTheme() {
  applyTheme(readTheme());
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
  window.addEventListener('langchange', () => syncToggle(document.documentElement.dataset.theme));
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.add('theme-ready');
    });
  });
  return readTheme();
}
