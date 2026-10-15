// Section 09: Luxury quote marquee (pure CSS infinite scroll, no JS animation)
import { t } from '../i18n/index.js';
export function initMarquee() {
  const section = document.getElementById('marquee');
  if (!section) return;

  section.innerHTML = `
    <div class="marquee-track">
      <span class="marquee-text" data-i18n="marquee.text">${t('marquee.text')}</span>
      <span class="marquee-text" aria-hidden="true" data-i18n="marquee.text">${t('marquee.text')}</span>
    </div>
  `;
}

initMarquee();
