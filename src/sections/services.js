import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { t } from '../i18n/index.js';

gsap.registerPlugin(ScrollTrigger);

// Section 04: Services (OUR EXPERTISE, 4-card grid)
export function initServices() {
  const section = document.getElementById('services');
  if (!section) return;

  const cards = [
    {
      titleKey: 'services.0.title',
      descKey: 'services.0.desc',
      icon: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="M6 18 L20 6 L34 18" stroke="#C9A96E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M10 16 V32 H30 V16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M17 32 V24 H23 V32" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
    },
    {
      titleKey: 'services.1.title',
      descKey: 'services.1.desc',
      icon: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="M8 34 V8 H24 L32 14 V34" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 34 H32" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M13 13 H18 M13 18 H18 M13 23 H18 M22 18 H27 M22 23 H27" stroke="#C9A96E" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`,
    },
    {
      titleKey: 'services.2.title',
      descKey: 'services.2.desc',
      icon: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="M8 22 V14 H32 V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6 22 H34 M10 22 V30 M30 22 V30 M10 26 H30" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="20" cy="9" r="3" stroke="#C9A96E" stroke-width="1.5"/>
      </svg>`,
    },
    {
      titleKey: 'services.3.title',
      descKey: 'services.3.desc',
      icon: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="M20 5 L34 13 V27 L20 35 L6 27 V13 Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M20 5 V20 M6 13 L20 20 L34 13 M20 20 V35" stroke="#C9A96E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
    },
  ];

  section.innerHTML = `
    <div class="services-wrap">
      <div class="services-head">
        <p class="services-eyebrow" data-i18n="services.eyebrow">${t('services.eyebrow')}</p>
        <h2 class="services-title" data-i18n="services.title">${t('services.title')}</h2>
      </div>
      <div class="services-grid">
        ${cards
          .map(
            (c) => `<article class="service-card">
              <div class="service-icon">${c.icon}</div>
              <h3 data-i18n="${c.titleKey}">${t(c.titleKey)}</h3>
              <p data-i18n="${c.descKey}">${t(c.descKey)}</p>
              <a class="service-link" href="#cta"><span data-i18n="services.learn">${t('services.learn')}</span> <span aria-hidden="true">→</span></a>
            </article>`
          )
          .join('')}
      </div>
    </div>
  `;

  gsap.fromTo(
    section.querySelectorAll('.service-card'),
    { y: 30, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.12,
      ease: 'power2.out',
      scrollTrigger: { trigger: section, start: 'top 80%' },
    }
  );
}

initServices();
