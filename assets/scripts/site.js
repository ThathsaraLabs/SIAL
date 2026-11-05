const toggle = document.querySelector('.menu');
const nav = document.querySelector('#navigation');
const header = document.querySelector('.site-header');
if (header) {
  const syncHeaderHeight = () => {
    document.documentElement.style.setProperty('--site-header-height', `${header.getBoundingClientRect().height}px`);
  };
  syncHeaderHeight();
  if ('ResizeObserver' in window) new ResizeObserver(syncHeaderHeight).observe(header);
  else window.addEventListener('resize', syncHeaderHeight);
}
if (toggle && nav) {
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (event) => { if (event.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
  matchMedia('(min-width: 1081px)').addEventListener('change', () => setOpen(false));
}
