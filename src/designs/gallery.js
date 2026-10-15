import { getLang, t } from '../i18n/index.js';
import config from '../data/design-config.json';

const PAGE = 24;
const CLOUD_FALLBACK = 'hygptczv';

function findLabel(list, id) {
  const lang = getLang();
  const hit = list.find((o) => o.id === id);
  if (!hit) return id;
  return hit[lang] || hit.en;
}

function keywordsFor(list, id) {
  const lang = getLang();
  const hit = list.find((o) => o.id === id);
  if (!hit || !hit.keywords) return [];
  return hit.keywords[lang] || hit.keywords.en || [];
}

function isFake(item) {
  return String(item.id || '').startsWith('test-');
}

function cloudUrl(cloud, item, w) {
  return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,w_${w},c_limit/v${item.v}/rana/designs/${item.id}`;
}

function altFor(item) {
  const type = findLabel(config.types, item.type).toLowerCase();
  const space = findLabel(config.spaces, item.space).toLowerCase();
  const room = item.room === 'any' ? '' : findLabel(config.rooms, item.room).toLowerCase();
  const lang = getLang();
  if (lang === 'hi') {
    return room ? `${space} ${room} के लिए ${type} डिज़ाइन` : `${space} के लिए ${type} डिज़ाइन`;
  }
  return room ? `${type} design for a ${space} ${room}` : `${type} design for a ${space}`;
}

function haystack(item) {
  const parts = [item.id, item.type, item.space, item.room, item.source];
  parts.push(findLabel(config.types, item.type));
  parts.push(findLabel(config.spaces, item.space));
  if (item.room !== 'any') parts.push(findLabel(config.rooms, item.room));
  parts.push(...keywordsFor(config.types, item.type));
  parts.push(...keywordsFor(config.spaces, item.space));
  if (item.room !== 'any') parts.push(...keywordsFor(config.rooms, item.room));
  return parts.join(' ').toLowerCase();
}

export async function initGallery() {
  const grid = document.getElementById('designs-grid');
  const empty = document.getElementById('designs-empty');
  const count = document.getElementById('designs-count');
  const clearBtn = document.getElementById('designs-clear');
  const moreBtn = document.getElementById('designs-more');
  const sentinel = document.getElementById('designs-sentinel');
  const search = document.getElementById('designs-search');
  const filtersBox = document.getElementById('designs-filters');
  const filtersToggle = document.getElementById('filters-toggle');
  const filtersCount = document.getElementById('filters-count');
  const typeBox = document.getElementById('type-chips');
  const spaceSel = document.getElementById('space-select');
  const roomSel = document.getElementById('room-select');
  if (!grid) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let cloud = CLOUD_FALLBACK;
  let all = [];
  try {
    const res = await fetch('/data/designs.json', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      cloud = data.cloud || CLOUD_FALLBACK;
      if (Array.isArray(data.items)) all = data.items;
    }
  } catch {
    all = [];
  }

  const params = new URLSearchParams(window.location.search);
  const state = {
    show: params.get('show') || 'all',
    type: params.get('type') || 'all',
    space: params.get('space') || 'all',
    room: params.get('room') || 'all',
    q: params.get('q') || ''
  };
  if (!['all', 'ours', 'ideas'].includes(state.show)) state.show = 'all';

  const liveTypes = new Set(all.map((i) => i.type));
  const liveSpaces = new Set(all.map((i) => i.space));
  const liveRooms = new Set(all.map((i) => i.room));
  const typeOpts = config.types.filter((o) => liveTypes.has(o.id));
  const spaceOpts = config.spaces.filter((o) => liveSpaces.has(o.id));
  const roomOpts = config.rooms.filter((o) => liveRooms.has(o.id));
  if (!typeOpts.some((o) => o.id === state.type)) state.type = 'all';
  if (!spaceOpts.some((o) => o.id === state.space)) state.space = 'all';
  if (!roomOpts.some((o) => o.id === state.room) && state.room !== 'any') {
    if (state.room !== 'all') state.room = 'all';
  }

  let visible = PAGE;
  let searchTimer = 0;
  if (search) search.value = state.q;

  function activeCount() {
    let n = 0;
    if (state.show !== 'all') n++;
    if (state.type !== 'all') n++;
    if (state.space !== 'all') n++;
    if (state.room !== 'all') n++;
    if (state.q.trim()) n++;
    return n;
  }

  function filtered() {
    const q = state.q.trim().toLowerCase();
    return all.filter((item) => {
      if (state.show === 'ours' && item.source !== 'ours') return false;
      if (state.show === 'ideas' && item.source === 'ours') return false;
      if (state.type !== 'all' && item.type !== state.type) return false;
      if (state.space !== 'all' && item.space !== state.space) return false;
      if (state.room !== 'all' && item.room !== state.room) return false;
      if (q && !haystack(item).includes(q)) return false;
      return true;
    });
  }

  function syncUrl() {
    const p = new URLSearchParams();
    if (state.show !== 'all') p.set('show', state.show);
    if (state.type !== 'all') p.set('type', state.type);
    if (state.space !== 'all') p.set('space', state.space);
    if (state.room !== 'all') p.set('room', state.room);
    if (state.q.trim()) p.set('q', state.q.trim());
    const qs = p.toString();
    history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }

  function renderFilterLabels() {
    document.querySelectorAll('.seg-btn').forEach((b) => {
      const k = b.dataset.show;
      b.classList.toggle('active', state.show === k);
    });
    if (search) {
      search.placeholder = t('designs.searchPh');
      search.setAttribute('aria-label', t('designs.searchPh'));
    }
    const n = activeCount();
    if (filtersCount) filtersCount.textContent = n > 0 ? ` (${n})` : '';
    if (count) {
      const list = filtered();
      count.textContent = t('designs.count').replace('{n}', String(list.length));
    }
    if (clearBtn) clearBtn.hidden = n === 0;
  }

  function renderFilters() {
    document.querySelectorAll('.seg-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.show === state.show);
    });
    if (typeBox) {
      typeBox.innerHTML = '';
      const mk = (id, label) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'chip' + (state.type === id ? ' active' : '');
        b.textContent = label;
        b.setAttribute('aria-pressed', state.type === id ? 'true' : 'false');
        b.addEventListener('click', () => {
          state.type = id;
          visible = PAGE;
          renderFilters();
          renderGrid(true);
          syncUrl();
        });
        return b;
      };
      typeBox.appendChild(mk('all', t('designs.all')));
      typeOpts.forEach((o) => {
        const lang = getLang();
        typeBox.appendChild(mk(o.id, o[lang] || o.en));
      });
    }
    if (spaceSel) {
      spaceSel.innerHTML = '';
      const a = document.createElement('option');
      a.value = 'all';
      a.textContent = t('designs.all');
      spaceSel.appendChild(a);
      spaceOpts.forEach((o) => {
        const lang = getLang();
        const op = document.createElement('option');
        op.value = o.id;
        op.textContent = o[lang] || o.en;
        spaceSel.appendChild(op);
      });
      spaceSel.value = state.space;
    }
    if (roomSel) {
      roomSel.innerHTML = '';
      const a = document.createElement('option');
      a.value = 'all';
      a.textContent = t('designs.all');
      roomSel.appendChild(a);
      roomOpts.forEach((o) => {
        const lang = getLang();
        const op = document.createElement('option');
        op.value = o.id;
        op.textContent = o[lang] || o.en;
        roomSel.appendChild(op);
      });
      if (liveRooms.has('any') && !roomOpts.some((o) => o.id === 'any')) {
        const op = document.createElement('option');
        op.value = 'any';
        op.textContent = 'any';
        roomSel.appendChild(op);
      }
      roomSel.value = state.room;
    }
    renderFilterLabels();
  }

  function cardEl(item) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'design-card';
    b.setAttribute('aria-label', altFor(item));
    const ours = item.source === 'ours';
    const badge = document.createElement('span');
    badge.className = 'design-badge' + (ours ? ' gold' : '');
    badge.textContent = ours ? t('designs.badgeOurs') : t('designs.badgeIdea');
    b.appendChild(badge);
    if (isFake(item)) {
      const d = document.createElement('span');
      d.className = 'design-fake';
      d.setAttribute('aria-hidden', 'true');
      b.appendChild(d);
      if (reduceMotion) b.classList.add('shown');
      else requestAnimationFrame(() => b.classList.add('shown'));
    } else {
      const img = document.createElement('img');
      const w = item.w || 1600;
      const h = item.h || 2000;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.width = w;
      img.height = h;
      img.alt = altFor(item);
      img.src = cloudUrl(cloud, item, 480);
      img.srcset = `${cloudUrl(cloud, item, 480)} 480w, ${cloudUrl(cloud, item, 960)} 960w`;
      img.sizes = '(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 25vw';
      img.addEventListener('load', () => b.classList.add('shown'), { once: true });
      img.addEventListener('error', () => b.classList.add('shown'), { once: true });
      b.appendChild(img);
    }
    b.addEventListener('click', () => {});
    return b;
  }

  function renderGrid(reset) {
    const list = filtered();
    if (reset) {
      grid.innerHTML = '';
    }
    const slice = list.slice(0, visible);
    grid.innerHTML = '';
    slice.forEach((item) => grid.appendChild(cardEl(item)));
    const done = slice.length >= list.length;
    if (empty) empty.hidden = list.length !== 0;
    if (moreBtn) moreBtn.hidden = done || list.length === 0;
    renderFilterLabels();
  }

  document.querySelectorAll('.seg-btn').forEach((b) => {
    b.addEventListener('click', () => {
      state.show = b.dataset.show;
      visible = PAGE;
      renderFilters();
      renderGrid(true);
      syncUrl();
    });
  });
  if (spaceSel) {
    spaceSel.addEventListener('change', () => {
      state.space = spaceSel.value;
      visible = PAGE;
      renderFilters();
      renderGrid(true);
      syncUrl();
    });
  }
  if (roomSel) {
    roomSel.addEventListener('change', () => {
      state.room = roomSel.value;
      visible = PAGE;
      renderFilters();
      renderGrid(true);
      syncUrl();
    });
  }
  if (search) {
    search.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        state.q = search.value;
        visible = PAGE;
        renderGrid(true);
        syncUrl();
        renderFilterLabels();
      }, 200);
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      state.show = 'all';
      state.type = 'all';
      state.space = 'all';
      state.room = 'all';
      state.q = '';
      if (search) search.value = '';
      visible = PAGE;
      renderFilters();
      renderGrid(true);
      syncUrl();
    });
  }
  if (filtersToggle && filtersBox) {
    filtersToggle.addEventListener('click', () => {
      const open = filtersBox.classList.toggle('open');
      filtersToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  function grow() {
    const list = filtered();
    if (visible >= list.length) return;
    visible += PAGE;
    renderGrid(true);
  }
  if (moreBtn) moreBtn.addEventListener('click', grow);
  if ('IntersectionObserver' in window && sentinel) {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) grow();
      },
      { rootMargin: '600px' }
    );
    io.observe(sentinel);
  }

  window.addEventListener('langchange', () => {
    document.title = t('designs.meta.title');
    renderFilters();
    renderGrid(true);
  });

  if (all.length === 0) {
    if (empty) empty.hidden = false;
    if (moreBtn) moreBtn.hidden = true;
  }
  renderFilters();
  renderGrid(true);
  syncUrl();
}
