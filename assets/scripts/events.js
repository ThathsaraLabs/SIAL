const posterDialog = document.querySelector('.event-dialog');
const posterLinks = [...document.querySelectorAll('.event-poster')];
const posterTitle = posterDialog.querySelector('#poster-title');
const posterImage = posterDialog.querySelector('.event-dialog-image');
const posterPosition = posterDialog.querySelector('.event-position');
let posterIndex = 0;

function showPoster(index) {
  posterIndex = (index + posterLinks.length) % posterLinks.length;
  const link = posterLinks[posterIndex];
  posterTitle.textContent = link.querySelector('h3').textContent;
  posterImage.alt = link.querySelector('img').alt;
  posterImage.src = link.href;
  posterPosition.textContent = `${posterIndex + 1} / ${posterLinks.length}`;
}

posterLinks.forEach((link, index) => {
  link.addEventListener('click', (event) => {
    if (typeof posterDialog.showModal !== 'function' || event.ctrlKey ||
        event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    showPoster(index);
    posterDialog.showModal();
  });
});

posterDialog.querySelectorAll('[data-poster-step]').forEach((button) => {
  button.addEventListener('click', () => showPoster(posterIndex + Number(button.dataset.posterStep)));
});

posterDialog.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showPoster(posterIndex + (event.key === 'ArrowLeft' ? -1 : 1));
  }
});
