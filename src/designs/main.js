import '../styles/variables.css';
import '../styles/main.css';
import './designs.css';

import '../i18n/index.js';
import { getLang, t, applyTranslations } from '../i18n/index.js';
import { initTheme } from '../utils/theme.js';
import { initNav } from '../utils/nav.js';
import { initGallery } from './gallery.js';

initTheme();
initNav();
applyTranslations();
document.title = t('designs.meta.title');

if (getLang()) {
  document.documentElement.lang = getLang();
}

initGallery();
