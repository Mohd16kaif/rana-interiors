// Language system: English default, persisted in localStorage under "ri-lang".
// Sections keep their DOM and swap text in place (no re-render).
import { en } from './en.js';
import { hi } from './hi.js';

const LANG_KEY = 'ri-lang';
const dicts = { en, hi };

let lang = 'en';
try {
  const saved = window.localStorage.getItem(LANG_KEY);
  if (saved === 'en' || saved === 'hi') lang = saved;
} catch (err) {
  // Storage unavailable; fall through to default.
}

export function getLang() {
  return lang;
}

export function t(key) {
  const hit = dicts[lang]?.[key];
  if (hit != null) return hit;
  return dicts.en[key] ?? key;
}

function syncLangButton() {
  const btn = document.getElementById('lang-toggle');
  if (!btn) return;
  const label = btn.querySelector('.lang-label');
  const english = lang === 'en';
  if (label) {
    label.textContent = english ? 'हिंदी' : 'EN';
    label.setAttribute('lang', english ? 'hi' : 'en');
  } else {
    btn.textContent = english ? 'हिंदी' : 'EN';
  }
  btn.setAttribute('aria-label', english ? t('lang.toHindi') : t('lang.toEnglish'));
}

export function applyTranslations(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  root.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria-label')));
  });
  root.querySelectorAll('[data-i18n-alt]').forEach((el) => {
    el.setAttribute('alt', t(el.getAttribute('data-i18n-alt')));
  });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
  });
}

export function setLang(next) {
  if (next !== 'en' && next !== 'hi') return lang;
  lang = next;
  try {
    window.localStorage.setItem(LANG_KEY, lang);
  } catch (err) {
    // Storage unavailable; language still applies for this visit.
  }
  document.documentElement.lang = lang;
  applyTranslations();
  document.title = t('meta.title');
  syncLangButton();
  window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  return lang;
}

document.getElementById('lang-toggle')?.addEventListener('click', () => {
  setLang(lang === 'en' ? 'hi' : 'en');
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
    syncLangButton();
  });
} else {
  applyTranslations();
  syncLangButton();
}
