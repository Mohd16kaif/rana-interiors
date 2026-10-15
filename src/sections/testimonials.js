// Section 08: Client Testimonials (drag-scroll card carousel)
import { t } from '../i18n/index.js';
export function initTestimonials() {
  const section = document.getElementById('testimonials');
  if (!section) return;

  // Names, cities, tags and quotes come from the i18n dictionaries (testi.N.*).
  // Initials stay in Latin letters in both languages.
  const testimonials = [
    { initials: 'PS' },
    { initials: 'RM' },
    { initials: 'AI' },
    { initials: 'VM' },
    { initials: 'SK' },
  ];

  section.innerHTML = `
    <div class="testi-head">
      <p class="testi-eyebrow" data-i18n="testi.eyebrow">${t('testi.eyebrow')}</p>
      <h2 class="testi-title" data-i18n="testi.title">${t('testi.title')}</h2>
    </div>
    <div class="testi-track" id="testi-track">
      ${testimonials
        .map(
          (s, i) => `<article class="testi-card">
            <div class="testi-top">
              <span class="testi-avatar" aria-hidden="true">${s.initials}</span>
              <div class="testi-who">
                <p class="testi-name" data-i18n="testi.${i}.name">${t(`testi.${i}.name`)}</p>
                <p class="testi-city" data-i18n="testi.${i}.city">${t(`testi.${i}.city`)}</p>
              </div>
            </div>
            <div class="testi-stars" data-i18n-aria-label="testi.stars" aria-label="${t('testi.stars')}">★★★★★</div>
            <blockquote class="testi-quote"><span aria-hidden="true">&ldquo;</span><span data-i18n="testi.${i}.quote">${t(`testi.${i}.quote`)}</span><span aria-hidden="true">&rdquo;</span></blockquote>
            <p class="testi-tag" data-i18n="testi.${i}.tag">${t(`testi.${i}.tag`)}</p>
          </article>`
        )
        .join('')}
    </div>
    <p class="testi-disclaimer" data-i18n="testi.disclaimer">${t('testi.disclaimer')}</p>
  `;

  // Drag-to-scroll (mouse)
  const track = section.querySelector('#testi-track');
  let isDown = false;
  let startX = 0;
  let startScroll = 0;

  track.addEventListener('mousedown', (e) => {
    isDown = true;
    track.classList.add('dragging');
    startX = e.pageX - track.offsetLeft;
    startScroll = track.scrollLeft;
  });
  track.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    track.scrollLeft = startScroll - (x - startX);
  });
  const endDrag = () => {
    isDown = false;
    track.classList.remove('dragging');
  };
  track.addEventListener('mouseup', endDrag);
  track.addEventListener('mouseleave', endDrag);
}

initTestimonials();
