import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { t } from '../i18n/index.js';

gsap.registerPlugin(ScrollTrigger);

// Section 07: The Process (4-step how we work, charcoal contrast band)
export function initProcess() {
  const section = document.getElementById('process');
  if (!section) return;

  const steps = [
    { n: '01', titleKey: 'process.0.title', descKey: 'process.0.desc' },
    { n: '02', titleKey: 'process.1.title', descKey: 'process.1.desc' },
    { n: '03', titleKey: 'process.2.title', descKey: 'process.2.desc' },
    { n: '04', titleKey: 'process.3.title', descKey: 'process.3.desc' },
  ];

  section.innerHTML = `
    <div class="process-wrap">
      <div class="process-head">
        <p class="process-eyebrow" data-i18n="process.eyebrow">${t('process.eyebrow')}</p>
        <h2 class="process-title" data-i18n="process.title">${t('process.title')}</h2>
      </div>
      <ol class="process-grid">
        ${steps
          .map(
            (s) => `<li class="process-step">
              <span class="process-circle">${s.n}</span>
              <h3 data-i18n="${s.titleKey}">${t(s.titleKey)}</h3>
              <p data-i18n="${s.descKey}">${t(s.descKey)}</p>
            </li>`
          )
          .join('')}
      </ol>
    </div>
  `;

  gsap.fromTo(
    section.querySelectorAll('.process-step'),
    { opacity: 0, x: -20 },
    {
      opacity: 1,
      x: 0,
      duration: 0.6,
      stagger: 0.12,
      ease: 'power2.out',
      scrollTrigger: { trigger: section, start: 'top 75%' },
    }
  );
}

initProcess();
