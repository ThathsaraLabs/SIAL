(() => {
  const section = document.querySelector('.home-stats');
  if (!section) return;
  const counters = [...section.querySelectorAll('[data-count]')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    const start = performance.now();
    const duration = 1500;
    const animate = now => {
      const progress = motion.matches ? 1 : Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      counters.forEach(counter => {
        counter.textContent = String(Math.round(Number(counter.dataset.count) * eased));
      });
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, { threshold: 0.25 });
  observer.observe(section);
})();
