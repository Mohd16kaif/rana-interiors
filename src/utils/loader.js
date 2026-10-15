// Loader timing: decode-gated logo, 900ms minimum, opacity-only fade.
// Scrub and frame logic are untouched; canvasScrub calls requestHide().
const MIN_MS = 900;
const FADE_MS = 500;

let logoAt = 0;
let hideQueued = false;
let isHidden = false;

function loaderEl() {
  return document.getElementById('loader');
}

function reducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (err) {
    return false;
  }
}

function unlockScroll() {
  document.documentElement.classList.remove('loader-lock');
  try {
    document.body.classList.remove('loader-lock');
  } catch (err) {}
}

function finish(loader) {
  loader.classList.remove('fading');
  loader.style.willChange = '';
  loader.setAttribute('aria-hidden', 'true');
  unlockScroll();
}

function applyHide() {
  const loader = loaderEl();
  if (!loader || isHidden) return;
  isHidden = true;
  if (reducedMotion()) {
    loader.classList.add('hidden');
    finish(loader);
    return;
  }
  loader.classList.add('fading');
  loader.style.willChange = 'opacity';
  loader.classList.add('hidden');
  setTimeout(() => finish(loader), FADE_MS + 60);
}

function doHide() {
  const loader = loaderEl();
  if (!loader || isHidden) return;
  const elapsed = logoAt ? performance.now() - logoAt : MIN_MS;
  const wait = Math.max(0, MIN_MS - elapsed);
  if (wait > 0) {
    setTimeout(() => {
      if (!isHidden) applyHide();
    }, wait);
  } else {
    applyHide();
  }
}

export function initLoader() {
  const loader = loaderEl();
  if (!loader) return;
  document.documentElement.classList.add('loader-lock');
  try {
    document.body.classList.add('loader-lock');
  } catch (err) {}
  const markVisible = () => {
    if (!logoAt) {
      try {
        logoAt = performance.now();
      } catch (err) {
        logoAt = Date.now();
      }
    }
    document.getElementById('loader-logo')?.classList.add('ready');
    if (hideQueued) doHide();
  };
  const img = document.getElementById('loader-logo');
  if (!img) {
    markVisible();
    return;
  }
  if (img.complete && img.naturalWidth) {
    markVisible();
    return;
  }
  let gated = false;
  const once = () => {
    if (!gated) {
      gated = true;
      markVisible();
    }
  };
  try {
    if (typeof img.decode === 'function') {
      img.decode().then(once).catch(once);
    } else {
      img.addEventListener('load', once, { once: true });
      img.addEventListener('error', once, { once: true });
    }
  } catch (err) {
    once();
  }
  setTimeout(once, 2500);
}

export function requestHide() {
  const loader = loaderEl();
  if (!loader || isHidden) return;
  if (!logoAt) {
    hideQueued = true;
    return;
  }
  doHide();
}

export function forceHideLoader() {
  const loader = loaderEl();
  if (!loader || isHidden) return;
  if (!logoAt) {
    try {
      logoAt = performance.now();
    } catch (err) {
      logoAt = Date.now();
    }
  }
  doHide();
}
