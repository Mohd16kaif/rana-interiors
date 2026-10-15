import { initCanvasScrub } from '../utils/canvasScrub.js';
import { reloadOnBranchChange } from '../utils/breakpoint.js';
import { t } from '../i18n/index.js';

// HERO: full-viewport scroll-scrubbed canvas (270 steps mapping frame_0241 → frame_0304)
// Frames live on Cloudinary (versioned delivery):
//   https://res.cloudinary.com/hygptczv/image/upload/v1791875980/frame_0241.jpg
//   https://res.cloudinary.com/hygptczv/image/upload/v1791876118/frame_0304.jpg
// Mobile (<768px): skip canvas, autoplay muted looping video1.mp4 + static overlay.
// Cloudinary ignores the version prefix for these public assets (verified),
// so a single latest-version base serves the whole 0241 → 0304 range.
const HERO_CLOUD_BASE =
  'https://res.cloudinary.com/hygptczv/image/upload/v1791876118';
export function initHero() {
  const section = document.getElementById('hero');
  if (!section) return;

  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  reloadOnBranchChange(isMobile);

  if (isMobile) {
    section.innerHTML = `
      <video id="hero-video" autoplay muted loop playsinline preload="metadata" poster="/video1-poster.webp" src="/video1-720.mp4"></video>
      <div class="hero-overlay visible static" id="hero-overlay">
        <p class="hero-label" data-i18n="hero.label">${t('hero.label')}</p>
        <h1 class="hero-headline" data-i18n="hero.headline">${t('hero.headline')}</h1>
        <p class="hero-sub" data-i18n="hero.sub">${t('hero.sub')}</p>
        <a class="hero-cta" href="#portfolio"><span data-i18n="hero.cta">${t('hero.cta')}</span> <span aria-hidden="true">→</span></a>
      </div>
    `;
    return;
  }

  section.innerHTML = `
    <canvas id="hero-canvas"></canvas>
    <div id="hero-loader" aria-hidden="true">
      <div id="hero-loader-track"><div id="hero-loader-bar"></div></div>
    </div>
    <div class="hero-overlay" id="hero-overlay">
      <p class="hero-label" data-i18n="hero.label">${t('hero.label')}</p>
      <h1 class="hero-headline" data-i18n="hero.headline">${t('hero.headline')}</h1>
      <p class="hero-sub" data-i18n="hero.sub">${t('hero.sub')}</p>
      <a class="hero-cta" href="#portfolio"><span data-i18n="hero.cta">${t('hero.cta')}</span> <span aria-hidden="true">→</span></a>
      <div class="scroll-cue" id="scroll-cue" aria-hidden="true"><span></span></div>
    </div>
  `;

  initCanvasScrub({
    cloudFolder: HERO_CLOUD_BASE,
    canvasId: 'hero-canvas',
    totalFrames: 270,
    pinDistance: '+=' + Math.round(Math.min(1620, Math.max(720, window.innerHeight * 2.2))) + 'px',
    textRevealAt: 0.85,
    frameStart: 241,
    frameEnd: 304,
  });

  const overlay = document.getElementById('hero-overlay');
  const onReveal = (e) => {
    if (e.detail?.canvasId === 'hero-canvas') overlay?.classList.add('visible');
  };
  window.addEventListener('revealText', onReveal);
  document.getElementById('hero-canvas')?.addEventListener('revealText', onReveal);

  // Scroll cue disappears once the user starts scrolling past the pin start
  const cue = document.getElementById('scroll-cue');
  const hideCue = () => {
    if (window.scrollY > 10) {
      cue?.classList.add('gone');
      window.removeEventListener('scroll', hideCue);
    }
  };
  window.addEventListener('scroll', hideCue, { passive: true });
}

initHero();
