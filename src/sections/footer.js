// Section 12: Footer (bottom of page)
import { t } from '../i18n/index.js';
export function initFooter() {
  const section = document.getElementById('footer');
  if (!section) return;

  const cols = [
    { headingKey: 'footer.svcTitle', baseKey: 'footer.svc', links: ['Residential', 'Commercial', 'Furniture', '3D Visualization', 'Consultation'] },
    {
      headingKey: 'footer.conTitle',
      links: [
        { labelKey: 'footer.contact', href: 'tel:+917999060809' },
        { labelKey: 'footer.whatsapp', href: 'https://wa.me/917999060809', target: '_blank', rel: 'noopener' },
      ],
    },
  ];

  const keywords = t('footer.keywords');

  const renderCopyright = () => {
    const el = section.querySelector('.footer-copy');
    if (el) el.textContent = `© ${new Date().getFullYear()} Rana Interiors. ${t('footer.rights')}`;
  };

  // Keep column nav labels in the current language
  const syncColLabels = () => {
    section.querySelectorAll('.footer-col').forEach((nav) => {
      const head = nav.querySelector('h4');
      if (head) nav.setAttribute('aria-label', head.textContent);
    });
  };

  window.addEventListener('langchange', () => {
    renderCopyright();
    syncColLabels();
  });

  section.innerHTML = `
    <div class="footer-top">
      <div class="footer-brand">
        <img class="footer-logo-img" src="/logo/logo-on-dark-480.webp" srcset="/logo/logo-on-dark-240.webp 240w, /logo/logo-on-dark-480.webp 480w, /logo/logo-on-dark-960.webp 960w" sizes="(max-width: 767px) 180px, 260px" alt="Rana Interiors" width="480" height="604" decoding="async" loading="lazy" />
        <p class="footer-tagline" data-i18n="footer.tagline">${t('footer.tagline')}</p>
        <p class="footer-line" data-i18n="footer.owner">${t('footer.owner')}</p>
        <p class="footer-line" data-i18n="footer.address">${t('footer.address')}</p>
        <p class="footer-line"><a class="footer-phone" href="tel:+917999060809">+91 79990 60809</a></p>
        <a class="footer-wa" href="https://wa.me/917999060809" target="_blank" rel="noopener"><span data-i18n="footer.chat">${t('footer.chat')}</span></a>
      </div>
      <div class="footer-cols">
        ${cols
          .map(
            (c) => `<nav class="footer-col" aria-label="${t(c.headingKey)}">
              <h4 data-i18n="${c.headingKey}">${t(c.headingKey)}</h4>
              ${c.links
                .map((l, i) => {
                  if (typeof l === 'string') {
                    const key = `${c.baseKey}.${i}`;
                    return `<a href="#" data-i18n="${key}">${t(key)}</a>`;
                  }
                  const extra = `${l.target ? ` target="${l.target}"` : ''}${l.rel ? ` rel="${l.rel}"` : ''}`;
                  return `<a href="${l.href}"${extra} data-i18n="${l.labelKey}">${t(l.labelKey)}</a>`;
                })
                .join('')}
            </nav>`
          )
          .join('')}
      </div>
    </div>
    <div class="footer-strip" aria-hidden="true">
      <div class="footer-strip-track">
        <span data-i18n="footer.keywords">${keywords}</span>
        <span data-i18n="footer.keywords">${keywords}</span>
      </div>
    </div>
    <div class="footer-bar">
      <p class="footer-copy">${`© ${new Date().getFullYear()} Rana Interiors. ${t('footer.rights')}`}</p>
    </div>
  `;
  syncColLabels();
}

initFooter();
