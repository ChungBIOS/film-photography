import { galleryPhotos } from './state.js';

let currentIndex = -1;

export function initLightbox() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('.tile-link');
    if (!a) return;
    e.preventDefault();
    currentIndex = parseInt(a.dataset.index, 10);
    openLightbox(currentIndex);
  });
}

function openLightbox(index) {
  const photos = galleryPhotos.current;
  const photo = photos[index];
  if (!photo) return;

  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.tabIndex = -1;
  overlay.style = `
    position:fixed;inset:0;background:rgba(0,0,0,.92);
    display:flex;align-items:center;justify-content:center;z-index:9999;
  `;

  const closeBtn = document.createElement('div');
  closeBtn.className = 'lb-close';
  closeBtn.textContent = '×';

  const img = new Image();
  img.src = `/img/${photo.base}-2560.jpg`;
  img.alt = '';
  img.style = 'max-width:95vw;max-height:95vh;';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'lb-arrow lb-prev';
  prevBtn.setAttribute('aria-label', 'Previous photo');
  prevBtn.innerHTML = '&#10094;';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'lb-arrow lb-next';
  nextBtn.setAttribute('aria-label', 'Next photo');
  nextBtn.innerHTML = '&#10095;';

  overlay.appendChild(closeBtn);
  overlay.appendChild(prevBtn);
  overlay.appendChild(nextBtn);
  overlay.appendChild(img);
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', keyHandler);
    document.body.style.overflow = '';
  };
  const step = delta => {
    currentIndex = (currentIndex + delta + photos.length) % photos.length;
    const p = photos[currentIndex];
    img.src = `/img/${p.base}-2560.jpg`;
  };
  const keyHandler = ev => {
    if (ev.key === 'Escape') close();
    if (ev.key === 'ArrowRight') step(1);
    if (ev.key === 'ArrowLeft') step(-1);
  };

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', ev => { if (ev.target === overlay) close(); });
  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));
  document.addEventListener('keydown', keyHandler);

  overlay.focus();
}
