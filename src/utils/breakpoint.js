// Branch watcher: hero and tour render either a canvas scrub branch or a
// video branch once at load. A reload is the safe option when the branch
// changes because the canvas size, frame set and ScrollTrigger pin geometry
// are all built once at init and cannot switch branches without a rebuild.
export function reloadOnBranchChange(renderedMobile) {
  let timer = 0;
  const clearFlag = () => {
    try {
      sessionStorage.removeItem('ri-branch-reload');
    } catch (err) {}
  };
  const armed = () => {
    try {
      if (sessionStorage.getItem('ri-branch-reload')) return false;
    } catch (err) {}
    return true;
  };
  const arm = () => {
    try {
      sessionStorage.setItem('ri-branch-reload', '1');
    } catch (err) {}
  };
  const maybeReload = (nowMobile) => {
    if (nowMobile === renderedMobile) return;
    if (!armed()) {
      clearFlag();
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      arm();
      window.location.reload();
    }, 300);
  };
  try {
    const mq = window.matchMedia('(max-width: 767px)');
    mq.addEventListener?.('change', (e) => maybeReload(e.matches));
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        maybeReload(window.matchMedia('(max-width: 767px)').matches);
      }, 300);
    });
  } catch (err) {}
  clearFlag();
}
