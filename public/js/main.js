// CandexAI Onboarding Guide — Interactivity

const ACCESS_KEY = 'candexai_guide_access';

document.addEventListener('DOMContentLoaded', () => {
  initAccessGate();
});

function initApp() {
  initSidebar();
  initLightbox();
  initReadingProgress();
  initMobileMenu();
}

function unlockGuide(email) {
  sessionStorage.setItem(ACCESS_KEY, email);
  document.body.classList.remove('access-locked');
  const gate = document.getElementById('access-gate');
  if (gate) {
    gate.classList.add('hidden');
    gate.setAttribute('aria-hidden', 'true');
  }
  initApp();
}

function initAccessGate() {
  const savedEmail = sessionStorage.getItem(ACCESS_KEY);
  if (savedEmail) {
    unlockGuide(savedEmail);
    return;
  }

  const form = document.getElementById('access-form');
  const emailInput = document.getElementById('access-email');
  const errorEl = document.getElementById('access-error');
  const submitBtn = document.getElementById('access-submit');

  if (!form || !emailInput || !submitBtn) {
    document.body.classList.remove('access-locked');
    initApp();
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (errorEl) {
        errorEl.textContent = 'Please enter a valid email address.';
        errorEl.hidden = false;
      }
      return;
    }

    if (errorEl) errorEl.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying...';

    try {
      const res = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Access request failed.');
      }

      unlockGuide(email);
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = err.message || 'Something went wrong. Please try again.';
        errorEl.hidden = false;
      }
      submitBtn.disabled = false;
      submitBtn.textContent = 'Continue to Guide';
    }
  });
}

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
