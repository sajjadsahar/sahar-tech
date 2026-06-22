/* ============================================================
   SAHAR TECHNOLOGY — Shared JavaScript Utilities
   ============================================================ */

/* ── Mobile nav toggle ── */
function initNav() {
  const toggle = document.querySelector('.nav-mobile-toggle');
  const links  = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    toggle.textContent = links.classList.contains('open') ? '✕' : '☰';
  });
  links.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.textContent = '☰';
    })
  );
}

/* ── Mark active nav link based on current page ── */
function markActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === page) a.classList.add('active');
  });
}

/* ── Smooth scroll for anchor links ── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ── Fade-in on scroll ── */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
}

/* ── Typed text effect (hero headline) ── */
function initTyped(el, words, speed = 90, pause = 1800) {
  if (!el) return;
  let wi = 0, ci = 0, deleting = false;
  function tick() {
    const word = words[wi];
    el.textContent = deleting ? word.slice(0, ci--) : word.slice(0, ci++);
    let delay = deleting ? speed / 2 : speed;
    if (!deleting && ci > word.length)  { delay = pause; deleting = true; }
    if (deleting  && ci < 0)            { deleting = false; wi = (wi + 1) % words.length; ci = 0; }
    setTimeout(tick, delay);
  }
  tick();
}

/* ── Contact form handler ── */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');
    const name    = form.querySelector('[name="name"]').value;
    const email   = form.querySelector('[name="email"]').value;
    const subject = form.querySelector('[name="subject"]').value;
    const message = form.querySelector('[name="message"]').value;
    // Build mailto link
    const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    const mailto = `mailto:65441@students.riphah.edu.pk?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    btn.textContent = '✓ Opening your email app…';
    btn.style.background = '#22c55e';
    setTimeout(() => {
      btn.textContent = 'Send Message';
      btn.style.background = '';
      form.reset();
    }, 3500);
  });
}

/* ── Private vault PIN guard ── */
function initVaultGuard(correctPin, onSuccess) {
  const overlay = document.getElementById('vaultOverlay');
  const form    = document.getElementById('pinForm');
  const input   = document.getElementById('pinInput');
  const errMsg  = document.getElementById('pinError');
  if (!overlay || !form) return;

  // Check session unlock
  if (sessionStorage.getItem('vault_unlocked') === '1') {
    overlay.style.display = 'none';
    if (onSuccess) onSuccess();
    return;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (input.value === correctPin) {
      sessionStorage.setItem('vault_unlocked', '1');
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.4s';
      setTimeout(() => { overlay.style.display = 'none'; }, 400);
      if (onSuccess) onSuccess();
    } else {
      errMsg.textContent = 'Incorrect PIN. Try again.';
      input.value = '';
      input.focus();
      setTimeout(() => errMsg.textContent = '', 2500);
    }
  });
}

/* ── Certificate upload & display (localStorage) ── */
function initCertVault() {
  const uploadInput = document.getElementById('certUpload');
  const gallery     = document.getElementById('certGallery');
  const emptyMsg    = document.getElementById('certEmpty');
  if (!uploadInput || !gallery) return;

  function loadCerts() {
    const certs = JSON.parse(localStorage.getItem('sahar_certs') || '[]');
    gallery.innerHTML = '';
    if (certs.length === 0) {
      if (emptyMsg) emptyMsg.style.display = 'block';
      return;
    }
    if (emptyMsg) emptyMsg.style.display = 'none';
    certs.forEach((cert, i) => {
      const card = document.createElement('div');
      card.className = 'cert-card';
      card.innerHTML = `
        <div class="cert-preview">
          <img src="${cert.data}" alt="${cert.name}" />
        </div>
        <div class="cert-info">
          <div class="cert-name">${cert.name}</div>
          <div class="cert-date">${cert.date}</div>
          <button class="cert-delete" data-index="${i}" title="Delete">✕ Remove</button>
        </div>`;
      gallery.appendChild(card);
    });
    gallery.querySelectorAll('.cert-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        certs.splice(idx, 1);
        localStorage.setItem('sahar_certs', JSON.stringify(certs));
        loadCerts();
      });
    });
  }

  uploadInput.addEventListener('change', () => {
    const files = Array.from(uploadInput.files);
    const certs = JSON.parse(localStorage.getItem('sahar_certs') || '[]');
    let pending = files.length;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        certs.push({ name: file.name, date: new Date().toLocaleDateString(), data: reader.result });
        pending--;
        if (pending === 0) {
          localStorage.setItem('sahar_certs', JSON.stringify(certs));
          loadCerts();
        }
      };
      reader.readAsDataURL(file);
    });
    uploadInput.value = '';
  });

  loadCerts();
}

/* ── Boot all on DOMContentLoaded ── */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  markActiveNav();
  initSmoothScroll();
  initScrollReveal();
  initContactForm();
});