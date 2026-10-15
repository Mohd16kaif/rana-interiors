import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { t } from '../i18n/index.js';

gsap.registerPlugin(ScrollTrigger);

// Section 11: Book a Consultation CTA (above footer)
export function initCta() {
  const section = document.getElementById('cta');
  if (!section) return;

  section.innerHTML = `
    <div class="cta-wrap">
      <p class="cta-eyebrow" data-i18n="cta.eyebrow">${t('cta.eyebrow')}</p>
      <h2 class="cta-title" data-i18n="cta.title">${t('cta.title')}</h2>
      <p class="cta-sub" data-i18n="cta.sub">${t('cta.sub')}</p>
      <div class="cta-btns">
        <a class="cta-primary" href="https://wa.me/917999060809?text=Hi%20Rana%20Interiors%2C%20I%20want%20to%20enquire%20about%20interior%20work" target="_blank" rel="noopener"><span data-i18n="cta.primary">${t('cta.primary')}</span></a>
        <a class="cta-secondary" href="#portfolio"><span data-i18n="cta.secondary">${t('cta.secondary')}</span> <span aria-hidden="true">&rarr;</span></a>
      </div>
    </div>
  `;

  gsap.fromTo(
    section.querySelector('.cta-wrap'),
    { opacity: 0, scale: 0.96 },
    {
      opacity: 1,
      scale: 1,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: { trigger: section, start: 'top 70%' },
    }
  );
}

initCta();
