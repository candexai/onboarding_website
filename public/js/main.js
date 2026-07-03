// CandexAI Onboarding Guide — Interactivity

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initLightbox();
  initReadingProgress();
  initMobileMenu();
});

function initSidebar() {
  const links = document.querySelectorAll('.sidebar a[href^="#"]');
  const sections = document.querySelectorAll('.guide-section[id]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
  );

  sections.forEach((s) => observer.observe(s));

  links.forEach((link) => {
    link.addEventListener('click', () => {
      document.querySelector('.sidebar')?.classList.remove('open');
    });
  });
}

function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  if (!lightbox || !lightboxImg) return;

  document.querySelectorAll('.screenshot-wrap img').forEach((img) => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  const close = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  };

  lightbox.addEventListener('click', close);
  document.querySelector('.lightbox-close')?.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

function initReadingProgress() {
  const bar = document.querySelector('.reading-progress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    bar.style.width = `${pct}%`;
  });
}

function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (!toggle || !sidebar) return;

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (
      sidebar.classList.contains('open') &&
      !sidebar.contains(e.target) &&
      !toggle.contains(e.target)
    ) {
      sidebar.classList.remove('open');
    }
  });
}
