// Section 02: Trust bar (awards / press marquee, pure CSS animation)
import { t } from '../i18n/index.js';
export function initTrustBar() {
  const section = document.getElementById('trust-bar');
  if (!section) return;

  const badges = [
    'ELLE DECOR',
    'ARCHITECTURAL DIGEST',
    'ID AWARDS 2024',
    'DESIGN WEEK',
    'DESIGNLINES',
    'BETTER HOMES',
    'FHM DESIGN',
    'DEZEEN',
    'WALLPAPER*',
  ];

  const oneSet = badges.map((b) => `<span class="trust-badge">${b}</span>`).join('');

  section.innerHTML = `
    <p class="trust-label" data-i18n="trust.label">${t('trust.label')}</p>
    <div class="trust-marquee">
      <div class="trust-track">${oneSet}${oneSet}</div>
    </div>
  `;
}

initTrustBar();
