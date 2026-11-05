(() => {
  const dialog = document.querySelector('.study-poster-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const image = dialog.querySelector('.study-poster-content img');
  let opener;
  document.querySelectorAll('[data-study-poster]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      image.src = link.href;
      image.alt = link.querySelector('img')?.alt || link.textContent.trim();
      dialog.showModal();
      dialog.querySelector('.study-poster-content').scrollTop = 0;
      document.body.classList.add('study-poster-open');
    });
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('study-poster-open');
    opener?.focus({ preventScroll: true });
  });
})();
