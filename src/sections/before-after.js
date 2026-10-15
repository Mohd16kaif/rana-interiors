import gsap from 'gsap';
import { t, getLang } from '../i18n/index.js';

// Section 03: Before / After drag reveal slider (premium)
export function initBeforeAfter() {
  const section = document.getElementById('before-after');
  if (!section) return;

  // PLACEHOLDER VALUES TO BE REPLACED WITH REAL ONES
  const stats = [
    { value: 150, suffix: '+', labelKey: 'ba.stat0' },
    { value: 8, suffix: '', labelKey: 'ba.stat1' },
    { value: 120, suffix: '+', labelKey: 'ba.stat2' },
  ];

  const statAria = (value, suffix, labelKey) =>
    `${value}${suffix ? (getLang() === 'hi' ? ' प्लस' : ' plus') : ''} ${t(labelKey)}`;

  section.innerHTML = `
    <div class="ba-head">
      <p class="ba-eyebrow" data-i18n="ba.eyebrow">${t('ba.eyebrow')}</p>
      <h2 class="ba-title" data-i18n="ba.title">${t('ba.title')}</h2>
      <p class="ba-sub" data-i18n="ba.sub">${t('ba.sub')}</p>
      <svg class="ba-arrows" width="48" height="16" viewBox="0 0 48 16" fill="none" aria-hidden="true">
        <path d="M8 1 L2 8 L8 15" stroke="#C9A96E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M40 1 L46 8 L40 15" stroke="#C9A96E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <div class="ba-slider" id="ba-slider">
      <div class="ba-after" id="ba-after"><img class="ba-photo" src="/gold2-after-1280.webp" srcset="/gold2-after-800.webp 800w, /gold2-after-1280.webp 1280w, /gold2-after-1600.webp 1510w" sizes="(max-width: 767px) 100vw, 1335px" data-i18n-alt="ba.altAfter" alt="${t('ba.altAfter')}" width="1510" height="896" draggable="false" decoding="async" loading="lazy"></div>
      <div class="ba-before" id="ba-before"><img class="ba-photo" src="/gold2-before-1280.webp" srcset="/gold2-before-800.webp 800w, /gold2-before-1280.webp 1280w, /gold2-before-1600.webp 1600w" sizes="(max-width: 767px) 100vw, 1335px" data-i18n-alt="ba.altBefore" alt="${t('ba.altBefore')}" width="1600" height="949" draggable="false" decoding="async" loading="lazy"></div>
      <div class="ba-divider" id="ba-divider"></div>
      <div class="ba-knob" id="ba-handle" role="slider" data-i18n-aria-label="ba.slider" aria-label="${t('ba.slider')}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" tabindex="0">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M6 3 L2 9 L6 15" stroke="#1A1A1A" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 3 L16 9 L12 15" stroke="#1A1A1A" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <span class="ba-badge ba-badge-before" data-i18n="ba.badgeBefore">${t('ba.badgeBefore')}</span>
      <span class="ba-badge ba-badge-after" data-i18n="ba.badgeAfter">${t('ba.badgeAfter')}</span>
    </div>
    <div class="ba-stats" id="ba-stats">
      ${stats
        .map(
          (s, i) => `<div class="ba-stat">
            <p class="ba-stat-n" data-stat="${i}" data-target="${s.value}" data-suffix="${s.suffix}" aria-label="${statAria(s.value, s.suffix, s.labelKey)}">0${s.suffix}</p>
            <p class="ba-stat-l" data-i18n="${s.labelKey}">${t(s.labelKey)}</p>
          </div>`
        )
        .join('')}
    </div>
  `;

  const container = section.querySelector('#ba-slider');
  const beforeImg = section.querySelector('#ba-before');
  const divider = section.querySelector('#ba-divider');
  const handle = section.querySelector('#ba-handle');

  const state = { percent: 50 };
  let isDragging = false;
  let hasAutoDemoed = false;

  function updateSlider(percent) {
    state.percent = percent;
    divider.style.left = percent + '%';
    handle.style.left = percent + '%';
    beforeImg.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
    handle.setAttribute('aria-valuenow', String(Math.round(percent)));
  }

  function setInstant(instant) {
    beforeImg.style.transition = instant ? 'none' : 'clip-path 0.15s ease';
  }

  function percentFromEvent(e) {
    const containerRect = container.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    let percent = ((clientX - containerRect.left) / containerRect.width) * 100;
    percent = Math.max(2, Math.min(98, percent));
    return percent;
  }

  function startDrag(e) {
    isDragging = true;
    gsap.killTweensOf(state);
    setInstant(true);
    handle.classList.add('dragging');
    requestAnimationFrame(() => updateSlider(percentFromEvent(e)));
  }

  function onDrag(e) {
    if (!isDragging) return;
    const percent = percentFromEvent(e);
    requestAnimationFrame(() => updateSlider(percent));
  }

  function stopDrag() {
    if (!isDragging) return;
    isDragging = false;
    handle.classList.remove('dragging');
    setInstant(false);
  }

  container.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);

  container.addEventListener('touchstart', startDrag, { passive: true });
  document.addEventListener('touchmove', onDrag, { passive: true });
  document.addEventListener('touchend', stopDrag, { passive: true });

  // Keyboard access
  handle.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      gsap.killTweensOf(state);
      const next = Math.max(2, Math.min(98, state.percent + (e.key === 'ArrowRight' ? 4 : -4)));
      updateSlider(next);
    }
  });

  updateSlider(50);

  // Auto-demo on first 40% visibility
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAutoDemoed) {
          hasAutoDemoed = true;
  updateSlider(50);

  // Animated stat count-up (runs once when the stats row is 50 percent visible)
  const statNums = Array.from(section.querySelectorAll('.ba-stat-n'));
  const showFinalStats = () => {
    statNums.forEach((el) => {
      el.textContent = `${el.dataset.target}${el.dataset.suffix}`;
    });
  };
  statNums.forEach((el) => {
    el.textContent = `0${el.dataset.suffix}`;
  });

  // Keep stat aria-labels in the current language without touching the numbers
  window.addEventListener('langchange', () => {
    section.querySelectorAll('.ba-stat-n').forEach((el) => {
      const i = Number(el.dataset.stat);
      el.setAttribute('aria-label', statAria(Number(el.dataset.target), el.dataset.suffix, stats[i].labelKey));
    });
  });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduceMotion) {
    showFinalStats();
  } else {
    const statObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            statNums.forEach((el, i) => {
              const target = Number(el.dataset.target);
              const suffix = el.dataset.suffix;
              const counter = { value: 0 };
              gsap.to(counter, {
                value: target,
                duration: 2.2,
                delay: i * 0.15,
                ease: 'power2.out',
                onUpdate: () => {
                  el.textContent = `${Math.round(counter.value)}${suffix}`;
                },
              });
            });
            statObserver.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );
    statObserver.observe(section.querySelector('#ba-stats'));
  }
          gsap.to(state, {
            percent: 22,
            duration: 0.9,
            ease: 'power2.inOut',
            onUpdate: () => updateSlider(state.percent),
            onComplete: () => {
              gsap.delayedCall(0.5, () => {
                gsap.to(state, {
                  percent: 50,
                  duration: 0.9,
                  ease: 'power2.inOut',
                  onUpdate: () => updateSlider(state.percent),
                });
              });
            },
          });
          observer.disconnect();
        }
      });
    },
    { threshold: 0.4 }
  );
  observer.observe(section);
}

initBeforeAfter();
