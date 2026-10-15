// Shared nav behaviour for index.html and designs.html: scrolled state,
// mobile menu panel, and moving the theme/language toggles into the panel
// at 480px and below (moved, never duplicated, so theme.js and i18n keep
// working on the same nodes).
import { t } from '../i18n/index.js';

export function initNav() {
  const nav = document.getElementById('site-nav');
  const isDesigns = !!document.getElementById('designs-page');

  function onScroll() {
    if (!nav) return;
    if (isDesigns || window.scrollY > 80) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const btn = document.getElementById('menu-toggle');
  const panel = document.getElementById('mobile-menu');
  if (!btn || !panel) return;

  const reducedMotion = () => {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (err) {
      return false;
    }
  };

  function syncMenuLabel() {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-label', open ? t('nav.closeMenu') : t('nav.openMenu'));
  }

  function lockScroll(lock) {
    document.documentElement.classList.toggle('menu-open', lock);
  }

  function openMenu() {
    btn.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    requestAnimationFrame(() => {
      panel.classList.add('open');
    });
    lockScroll(true);
    syncMenuLabel();
    panel.querySelector('a')?.focus({ preventScroll: true });
  }

  function closeMenu(returnFocus) {
    if (btn.getAttribute('aria-expanded') !== 'true') return;
    btn.setAttribute('aria-expanded', 'false');
    panel.classList.remove('open');
    lockScroll(false);
    syncMenuLabel();
    const hide = () => {
      panel.hidden = true;
    };
    if (reducedMotion()) {
      hide();
    } else {
      setTimeout(hide, 260);
    }
    if (returnFocus) btn.focus({ preventScroll: true });
  }

  btn.addEventListener('click', () => {
    if (btn.getAttribute('aria-expanded') === 'true') {
      closeMenu(false);
    } else {
      openMenu();
    }
  });

  panel.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => closeMenu(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu(true);
  });

  document.addEventListener('pointerdown', (e) => {
    if (
      btn.getAttribute('aria-expanded') === 'true' &&
      !nav.contains(e.target)
    ) {
      closeMenu(false);
    }
  });

  window.addEventListener('langchange', syncMenuLabel);

  try {
    const mqWide = window.matchMedia('(min-width: 768px)');
    const closeOnWide = (e) => {
      if (e.matches) closeMenu(false);
    };
    mqWide.addEventListener?.('change', closeOnWide);
  } catch (err) {}

  // At 480px and below the bar keeps logo, compact Book a Call and the menu
  // button; the existing toggle nodes move into the panel slot and back.
  try {
    const mqSmall = window.matchMedia('(max-width: 480px)');
    const controls = document.getElementById('nav-controls');
    const slot = document.getElementById('menu-toggles-slot');
    const navRight = nav.querySelector('.nav-right');
    const place = () => {
      if (!controls || !slot || !navRight) return;
      if (mqSmall.matches) {
        if (controls.parentElement !== slot) slot.appendChild(controls);
      } else {
        if (controls.parentElement !== navRight) navRight.appendChild(controls);
        closeMenu(false);
      }
    };
    mqSmall.addEventListener?.('change', place);
    place();
  } catch (err) {}
}
