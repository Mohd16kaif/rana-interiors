import { initCanvasScrub } from '../utils/canvasScrub.js';
import { reloadOnBranchChange } from '../utils/breakpoint.js';
import { t } from '../i18n/index.js';

// Section 05: Interior tour canvas scrub (frames2, kitchen and dining orbit)
// Placed directly below Services. Desktop: pinned full-bleed canvas scrub
// (100vw × 100vh), copy always visible, link reveals at 90%.
// Frames live on Cloudinary (versioned delivery):
//   START: https://res.cloudinary.com/hygptczv/image/upload/v1791877586/frame_0240.jpg
//   END:   https://res.cloudinary.com/hygptczv/image/upload/v1791876824/frame_0001.jpg
// Cloudinary ignores the version prefix for these public assets (verified),
// so a single latest-version base serves the whole 0240 → 0001 range.
// Mobile (<768px): autoplay muted looping video2.mp4 + centered static copy.
const TOUR_CLOUD_BASE =
  'https://res.cloudinary.com/hygptczv/image/upload/v1791877586';
export function initInteriorTour() {
  const section = document.getElementById('interior-tour');
  if (!section) return;

  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  reloadOnBranchChange(isMobile);

  if (isMobile) {
    section.innerHTML = `
      <video id="tour-video" autoplay muted loop playsinline preload="metadata" poster="/video2-poster.webp" src="/video2-720.mp4"></video>
      <div class="tour-shade"></div>
      <div class="tour-copy static" id="tour-copy">
        <p class="tour-label" data-i18n="tour.label">${t('tour.label')}</p>
        <h2 class="tour-headline" data-i18n="tour.headline">${t('tour.headline')}</h2>
        <p class="tour-body" data-i18n="tour.body">${t('tour.body')}</p>
        <a class="tour-link visible" href="#portfolio"><span data-i18n="tour.link">${t('tour.link')}</span> <span aria-hidden="true">→</span></a>
      </div>
    `;
    return;
  }

  section.innerHTML = `
    <canvas id="tour-canvas"></canvas>
    <div class="tour-shade"></div>
    <div class="tour-copy" id="tour-copy">
      <p class="tour-label" data-i18n="tour.label">${t('tour.label')}</p>
      <h2 class="tour-headline" data-i18n="tour.headline">${t('tour.headline')}</h2>
      <p class="tour-body" data-i18n="tour.body">${t('tour.body')}</p>
      <a class="tour-link" id="tour-link" href="#portfolio"><span data-i18n="tour.link">${t('tour.link')}</span> <span aria-hidden="true">→</span></a>
    </div>
  `;

  initCanvasScrub({
    cloudFolder: TOUR_CLOUD_BASE,
    canvasId: 'tour-canvas',
    totalFrames: 270,
    pinDistance: '+=' + Math.round(Math.min(1620, Math.max(720, window.innerHeight * 2.2))) + 'px',
    textRevealAt: 0.90,
    frameStart: 240,
    frameEnd: 1,
  });

  const link = document.getElementById('tour-link');
  const onReveal = (e) => {
    if (e.detail?.canvasId === 'tour-canvas') link?.classList.add('visible');
  };
  window.addEventListener('revealText', onReveal);
  document.getElementById('tour-canvas')?.addEventListener('revealText', onReveal);
}

initInteriorTour();
