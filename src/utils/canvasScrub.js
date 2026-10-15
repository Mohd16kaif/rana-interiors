import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { requestHide } from './loader.js';

gsap.registerPlugin(ScrollTrigger);

const CLOUDINARY_BASE = 'https://res.cloudinary.com/hygptczv/image/upload';

/**
 * Build a frame URL from a folder base + frame index.
 * - 'frames1' / 'frames2' map to Cloudinary (versionless URLs work):
 *     https://res.cloudinary.com/hygptczv/image/upload/frame_0001.jpg
 * - full http(s) base URLs are used as-is, version prefix included, e.g.:
 *     https://res.cloudinary.com/hygptczv/image/upload/v1791876118
 *     → https://res.cloudinary.com/hygptczv/image/upload/v1791876118/frame_0001.jpg
 * - anything else is treated as a local/public folder path
 * Frames are 1-indexed on disk with 4-digit padding: frame_0001.jpg
 */
export function getFrameURL(folder, frameIndex) {
  return getFrameURLInRange(folder, frameIndex, frameIndex + 1, 1, frameIndex + 1);
}

/**
 * Map a 0-based scrub index onto an explicit Cloudinary frame-number range.
 * frameIndex 0 → frameStart, frameIndex (totalFrames - 1) → frameEnd.
 * Example: hero plays living-room slice frame_0241 → frame_0304 over 270 steps.
 */
export function getFrameURLInRange(folder, frameIndex, totalFrames, frameStart, frameEnd) {
  const span = frameEnd - frameStart;
  const denom = Math.max(1, totalFrames - 1);
  const frameNumber = frameStart + Math.round((frameIndex * span) / denom);
  const padded = String(frameNumber).padStart(4, '0');
  const file = `frame_${padded}.jpg`;
  if (folder === 'frames1' || folder === 'frames2') {
    return `${CLOUDINARY_BASE}/${file}`;
  }
  if (/^https?:\/\//.test(folder)) {
    const base = folder.replace(/\/$/, '');
    return `${base}/${file}`;
  }
  const base = folder.replace(/\/$/, '');
  return `${base}/${file}`;
}

let barPct = 0;
let barQueued = false;

function paintBars() {
  barQueued = false;
  const bar = document.getElementById('loader-bar');
  if (bar) bar.style.transform = `scaleX(${barPct})`;
  const heroBar = document.getElementById('hero-loader-bar');
  if (heroBar) heroBar.style.transform = `scaleX(${barPct})`;
}

function updateLoader(loaded, total) {
  barPct = Math.min(1, total ? loaded / total : 1);
  if (!barQueued) {
    barQueued = true;
    requestAnimationFrame(paintBars);
  }
}

function hideLoader() {
  requestHide();
  const heroLoader = document.getElementById('hero-loader');
  if (heroLoader && !heroLoader.classList.contains('hidden')) {
    heroLoader.classList.add('hidden');
  }
}

/**
 * Shared canvas scroll-scrub.
 *
 * @param {Object} opts
 * @param {string} opts.cloudFolder  - Cloudinary base URL or folder path for frames
 * @param {string} opts.canvasId     - <canvas> element id
 * @param {number} opts.totalFrames  - total frame count
 * @param {string|number} opts.pinDistance - ScrollTrigger `end`, e.g. "+=2500"
 * @param {number} opts.textRevealAt - progress 0..1 at which to emit 'revealText'
 * @param {number} [opts.frameStart=1] - first Cloudinary frame number (scrub index 0 maps here)
 * @param {number|null} [opts.frameEnd=null] - last Cloudinary frame number (defaults to frameStart + totalFrames - 1)
 * @returns {{ images: HTMLImageElement[], trigger: ScrollTrigger }} handles
 */
export function initCanvasScrub({ cloudFolder, canvasId, totalFrames, pinDistance, textRevealAt = 0.5, frameStart = 1, frameEnd = null }) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.warn(`[canvasScrub] canvas #${canvasId} not found`);
    return { images: [], trigger: null };
  }

  const section = canvas.closest('section') || canvas.parentElement;
  const ctx = canvas.getContext('2d');

  const end = frameEnd ?? frameStart + totalFrames - 1;

  const images = new Array(totalFrames);
  let loadedCount = 0;
  let firstFrameReady = false;
  let textRevealed = false;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = section.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
    // Redraw current frame after resize
    if (images[currentFrameIndex]?.complete && images[currentFrameIndex]?.naturalWidth) {
      drawFrame(images[currentFrameIndex]);
    }
  }

  function drawFrame(img) {
    if (!img || !img.naturalWidth) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
    const x = (canvas.width - img.naturalWidth * scale) / 2;
    const y = (canvas.height - img.naturalHeight * scale) / 2;
    ctx.drawImage(img, x, y, img.naturalWidth * scale, img.naturalHeight * scale);
  }

  let currentFrameIndex = 0;

  function render(progress) {
    const frameIndex = Math.min(
      totalFrames - 1,
      Math.max(0, Math.floor(progress * (totalFrames - 1)))
    );
    currentFrameIndex = frameIndex;
    const img = images[frameIndex];
    if (img && img.complete && img.naturalWidth) {
      drawFrame(img);
    }

    if (!textRevealed && progress >= textRevealAt) {
      textRevealed = true;
      window.dispatchEvent(
        new CustomEvent('revealText', { detail: { canvasId, progress } })
      );
      canvas.dispatchEvent(
        new CustomEvent('revealText', { detail: { canvasId, progress }, bubbles: true })
      );
    } else if (textRevealed && progress < textRevealAt - 0.02) {
      // Allow re-trigger when scrolling back up past threshold
      textRevealed = false;
    }
  }

  // Preload all frames (indices map onto [frameStart, frameEnd])
  for (let i = 0; i < totalFrames; i++) {
    const img = new Image();
    img.src = getFrameURLInRange(cloudFolder, i, totalFrames, frameStart, end);
    img.onload = () => {
      loadedCount++;
      updateLoader(loadedCount, totalFrames);
      // Draw first frame as soon as it's ready
      if (i === 0 && !firstFrameReady) {
        firstFrameReady = true;
        drawFrame(img);
        hideLoader();
      } else if (!firstFrameReady && images[0]?.complete && images[0]?.naturalWidth) {
        firstFrameReady = true;
        drawFrame(images[0]);
        hideLoader();
      }
      // Keep current frame fresh as frames stream in
      if (i === currentFrameIndex) drawFrame(img);
    };
    img.onerror = () => {
      loadedCount++;
      updateLoader(loadedCount, totalFrames);
      // Don't block the loader on missing frames in dev/placeholder mode
      if (loadedCount === 1 || (i === 0 && !firstFrameReady)) {
        hideLoader();
      }
    };
    images[i] = img;
  }

  resize();
  window.addEventListener('resize', resize);

  const tween = gsap.to(
    { progress: 0 },
    {
      progress: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: pinDistance,
        pin: true,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => render(self.progress),
      },
    }
  );

  // Initial paint attempt (placeholder gradient until frames arrive)
  ctx.fillStyle = '#2D2B27';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return { images, trigger: tween.scrollTrigger };
}
