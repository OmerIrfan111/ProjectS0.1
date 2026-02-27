/* ============================================================
   ZYROMARK DIGITAL SOLUTIONS — Scripts
   ============================================================ */

(function () {
  'use strict';

  /* ─── UTILITIES ─── */
  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ─── NAVIGATION: scroll-based class + mobile burger ─── */
  const nav      = qs('#nav');
  const burger   = qs('#navBurger');
  const navLinks = qs('#navLinks');

  function updateNav() {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  burger?.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    burger.classList.toggle('open');
    // Animate burger → X
    const spans = qsa('span', burger);
    if (burger.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  // Close mobile nav on link click
  qsa('.nav__link', navLinks).forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      burger.classList.remove('open');
      qsa('span', burger).forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });

  /* ─── SCROLL REVEAL (Intersection Observer) ─── */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger siblings in the same grid
          const siblings = qsa('.reveal:not(.visible)', entry.target.parentElement);
          const delay    = Array.from(entry.target.parentElement.querySelectorAll('.reveal'))
                               .indexOf(entry.target) * 60;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, Math.min(delay, 300));
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  qsa('.reveal').forEach(el => revealObserver.observe(el));

  /* ─── COUNTER ANIMATION ─── */
  function animateCounter(el) {
    const target   = parseFloat(el.dataset.target);
    const duration = 1800;
    const start    = performance.now();

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    }
    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  qsa('.counter').forEach(el => counterObserver.observe(el));

  /* ─── PORTFOLIO FILTER ─── */
  const filterBtns   = qsa('.filter-btn');
  const portfolioCards = qsa('.portfolio-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show/hide cards with a fade
      portfolioCards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        if (match) {
          card.style.display = '';
          // Re-trigger animation
          card.classList.remove('visible');
          requestAnimationFrame(() => {
            requestAnimationFrame(() => card.classList.add('visible'));
          });
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* ─── CONTACT FORM ─── */
  const auditForm = qs('#auditForm');

  auditForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    const name    = qs('#name', auditForm).value.trim();
    const email   = qs('#email', auditForm).value.trim();
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name) { showError(qs('#name', auditForm), 'Please enter your name.'); return; }
    if (!email || !emailRx.test(email)) { showError(qs('#email', auditForm), 'Please enter a valid email.'); return; }

    // Simulate async submission
    const submitBtn  = auditForm.querySelector('[type="submit"]');
    const btnText    = auditForm.querySelector('.btn-text');
    const btnSuccess = auditForm.querySelector('.btn-success');

    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';

    setTimeout(() => {
      btnText.classList.add('hidden');
      btnSuccess.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.style.opacity = '';
      submitBtn.style.background = 'linear-gradient(135deg, #00c9a7 0%, #00a882 100%)';

      // Reset after 4 seconds
      setTimeout(() => {
        auditForm.reset();
        btnText.classList.remove('hidden');
        btnSuccess.classList.add('hidden');
        submitBtn.style.background = '';
      }, 4000);
    }, 1200);
  });

  function showError(input, message) {
    input.style.borderColor = '#ff4d6d';
    input.focus();

    // Remove existing error label
    const prev = input.parentElement.querySelector('.field-error');
    if (prev) prev.remove();

    const err = document.createElement('span');
    err.className   = 'field-error';
    err.textContent = message;
    err.style.cssText = 'font-size:0.75rem;color:#ff4d6d;margin-top:2px;';
    input.parentElement.appendChild(err);

    input.addEventListener('input', () => {
      input.style.borderColor = '';
      err.remove();
    }, { once: true });
  }

  /* ─── SMOOTH ACTIVE NAV LINK HIGHLIGHTING ─── */
  const sections = qsa('section[id]');
  const navLinkEls = qsa('.nav__link');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinkEls.forEach(link => {
            link.classList.toggle(
              'nav__link--active',
              link.getAttribute('href') === `#${id}`
            );
          });
        }
      });
    },
    { rootMargin: '-40% 0px -50% 0px' }
  );

  sections.forEach(s => sectionObserver.observe(s));

  /* ─── OPTIONAL: Parallax depth on hero glow ─── */
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const heroBg = qs('.hero__bg-grid');
    if (heroBg) {
      heroBg.style.transform = `translateY(${y * 0.2}px)`;
    }
  }, { passive: true });

  /* ─── JOTFORM MODAL ─── */
  const jotformModal = qs('#jotformModal');
  const openFormBtn1 = qs('#openFormBtn1');
  const openFormBtn2 = qs('#openFormBtn2');
  const closeFormBtn = qs('#closeFormBtn');
  const modalOverlay = qs('.jotform-modal__overlay');

  function openJotformModal(e) {
    e.preventDefault();
    jotformModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeJotformModal() {
    jotformModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  openFormBtn1?.addEventListener('click', openJotformModal);
  openFormBtn2?.addEventListener('click', openJotformModal);
  closeFormBtn?.addEventListener('click', closeJotformModal);
  modalOverlay?.addEventListener('click', closeJotformModal);

  // Close modal with ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && jotformModal.classList.contains('active')) {
      closeJotformModal();
    }
  });

  /* ─── IMAGE MODAL ─── */
  window.openImageModal = function(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    modal.classList.add('active');
    modal.style.display = 'flex';
    modalImg.src = imageSrc;
    document.body.style.overflow = 'hidden';
  };

  window.closeImageModal = function() {
    const modal = document.getElementById('imageModal');
    modal.classList.remove('active');
    modal.style.display = 'none';
    document.body.style.overflow = '';
  };

  // Close image modal on outside click
  document.getElementById('imageModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
      closeImageModal();
    }
  });

  // Close image modal with ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeImageModal();
    }
  });

})();
