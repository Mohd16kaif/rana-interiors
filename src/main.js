import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import './styles/variables.css';
import './styles/main.css';

gsap.registerPlugin(ScrollTrigger);

import './sections/hero.js';
import './sections/trust-bar.js';
import './sections/before-after.js';
import './sections/services.js';
import './sections/interior-tour.js';
import './sections/portfolio.js';
import './sections/process.js';
import './sections/testimonials.js';
import './sections/marquee.js';
import './sections/cta.js';
import './sections/footer.js';

import { initTheme } from './utils/theme.js';
import { initLoader, forceHideLoader } from './utils/loader.js';
import { initNav } from './utils/nav.js';

initLoader();
initTheme();
initNav();

// Safety: never trap the user behind the loader.
// If Section 01 frames fail (placeholder Cloudinary URL), force-hide after 6s.
setTimeout(() => {
  forceHideLoader();
}, 6000);
