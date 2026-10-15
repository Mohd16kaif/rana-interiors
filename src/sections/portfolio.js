// Section 06: Selected Works (horizontal drag-to-scroll gallery)
import { t } from '../i18n/index.js';
export function initPortfolio() {
  const section = document.getElementById('portfolio');
  if (!section) return;

  // Project cards: photo files live in public/ and are referenced by root path.
  // Names, tags and alts come from the i18n dictionaries (portfolio.N.name/tag/alt).
  const projects = [
    { src: '/project1.webp', width: 800, height: 1138 },
    { src: '/project2.webp', width: 800, height: 1073 },
    { src: '/project3.webp', width: 736, height: 981 },
    { src: '/project4.webp', width: 800, height: 1098 },
    { src: '/project5.webp', width: 800, height: 1049 },
    { src: '/project6.webp', width: 800, height: 1029 },
    { src: '/project7.webp', width: 800, height: 1041 },
  ];

  section.innerHTML = `
    <div class="portfolio-head">
      <p class="portfolio-eyebrow" data-i18n="portfolio.eyebrow">${t('portfolio.eyebrow')}</p>
      <h2 class="portfolio-title" data-i18n="portfolio.title">${t('portfolio.title')}</h2>
      <p class="portfolio-sub" data-i18n="portfolio.sub">${t('portfolio.sub')}</p>
    </div>
    <div class="portfolio-track" id="portfolio-track">
      ${projects
        .map(
          (p, i) => `<figure class="portfolio-card" tabindex="0" aria-pressed="false">
            <div class="pf-img">
              <img class="pf-photo" src="${p.src}" sizes="(max-width: 767px) 280px, 340px" data-i18n-alt="portfolio.${i}.alt" alt="${t(`portfolio.${i}.alt`)}" width="${p.width}" height="${p.height}" draggable="false" decoding="async" loading="lazy">
            </div>
            <figcaption>
              <p class="pf-name" data-i18n="portfolio.${i}.name">${t(`portfolio.${i}.name`)}</p>
              <p class="pf-tag" data-i18n="portfolio.${i}.tag">${t(`portfolio.${i}.tag`)}</p>
            </figcaption>
          </figure>`
        )
        .join('')}
    </div>
  `;

  // Drag-to-scroll (mouse)
  const track = section.querySelector('#portfolio-track');
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

  // Tap to enlarge (touch devices only; mouse drag logic above is untouched)
  if (window.matchMedia('(hover: none)').matches) {
    const cards = Array.from(section.querySelectorAll('.portfolio-card'));

    const clearActive = () => {
      cards.forEach((c) => {
        c.classList.remove('is-active');
        c.setAttribute('aria-pressed', 'false');
      });
    };

    track.addEventListener('click', (e) => {
      const card = e.target.closest('.portfolio-card');
      if (!card) return;
      const wasActive = card.classList.contains('is-active');
      clearActive();
      if (!wasActive) {
        card.classList.add('is-active');
        card.setAttribute('aria-pressed', 'true');
        card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#portfolio')) clearActive();
    });
  }
}

initPortfolio();
