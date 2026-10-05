document.addEventListener('DOMContentLoaded', () => {

  /* Toggle theme clair / sombre avec rideau de code */
  const themeBtn = document.getElementById('theme-toggle');
  const overlay = document.getElementById('theme-transition');
  const overlayCanvas = document.getElementById('theme-transition-canvas');

  const applyThemeSwitch = () => {
    const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if(themeBtn && (!overlay || !overlayCanvas || reduceMotion)){
    themeBtn.addEventListener('click', applyThemeSwitch);
  } else if(themeBtn){
    const ctx = overlayCanvas.getContext('2d');
    const chars = '01{}[]<>/;:=+-_#$%01010110';
    const fontSize = 15;
    let running = false;

    themeBtn.addEventListener('click', () => {
      if(running) return;
      running = true;

      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth, h = window.innerHeight;
      overlayCanvas.width = w * dpr;
      overlayCanvas.height = h * dpr;
      overlayCanvas.style.width = w + 'px';
      overlayCanvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.ceil(w / 16);
      const drops = new Array(cols).fill(0);

      ctx.fillStyle = '#0b0d11';
      ctx.fillRect(0, 0, w, h);

      overlay.style.pointerEvents = 'auto';
      overlay.classList.add('active');

      const accent = getComputedStyle(document.documentElement).getPropertyValue('--orange').trim() || '#ff7a35';
      const start = performance.now();
      const duration = 900;
      let switched = false;

      const frame = (now) => {
        const elapsed = now - start;
        ctx.fillStyle = 'rgba(11,13,17,0.15)';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = accent;
        ctx.font = `${fontSize}px "IBM Plex Mono", monospace`;

        for(let i = 0; i < drops.length; i++){
          const text = chars.charAt(Math.floor(Math.random() * chars.length));
          const x = i * 16;
          const y = drops[i] * fontSize;
          ctx.fillText(text, x, y);
          if(y > h && Math.random() > 0.975) drops[i] = 0;
          drops[i]++;
        }

        if(!switched && elapsed > duration * 0.5){
          switched = true;
          applyThemeSwitch();
        }

        if(elapsed < duration){
          requestAnimationFrame(frame);
        } else {
          overlay.classList.remove('active');
          overlay.style.pointerEvents = 'none';
          running = false;
        }
      };
      requestAnimationFrame(frame);
    });
  }

  /* Reveal on scroll */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* Scroll progress bar */
  const progressBar = document.querySelector('.scroll-progress');
  const updateProgress = () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    if(progressBar) progressBar.style.width = scrolled + '%';
  };
  document.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* Active nav link on scroll */
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const sections = Array.from(navLinks).map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = '#' + entry.target.id;
      const link = document.querySelector(`.nav-links a[href="${id}"]`);
      if(!link) return;
      if(entry.isIntersecting){
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
  sections.forEach(s => navObserver.observe(s));

  /* Typing effect on hero role */
  const roleEl = document.getElementById('role-text');
  if(roleEl){
    const roles = [
      'Bachelor Architecte en Logiciels Performants et Sécurisés — 3e année',
      'Ancien technicien réseaux et systèmes',
      'À la recherche d\'une alternance dès 2026'
    ];
    let roleIndex = 0, charIndex = 0, deleting = false;
    const typeSpeed = 38, deleteSpeed = 20, pause = 1800;

    const tick = () => {
      const current = roles[roleIndex];
      if(!deleting){
        charIndex++;
        roleEl.textContent = current.slice(0, charIndex);
        if(charIndex === current.length){
          deleting = true;
          setTimeout(tick, pause);
          return;
        }
        setTimeout(tick, typeSpeed);
      } else {
        charIndex--;
        roleEl.textContent = current.slice(0, charIndex);
        if(charIndex === 0){
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          setTimeout(tick, 300);
          return;
        }
        setTimeout(tick, deleteSpeed);
      }
    };
    tick();
  }

  /* Copy email to clipboard */
  const copyBtn = document.getElementById('copy-email');
  if(copyBtn){
    copyBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = copyBtn.dataset.email;
      try{
        await navigator.clipboard.writeText(email);
        copyBtn.classList.add('copied');
        setTimeout(() => copyBtn.classList.remove('copied'), 1800);
      }catch(err){
        window.location.href = 'mailto:' + email;
      }
    });
  }

  /* Uptime counter (clin d'oeil systeme) */
  const uptimeEl = document.getElementById('uptime');
  if(uptimeEl){
    const start = Date.now();
    setInterval(() => {
      const diff = Math.floor((Date.now() - start) / 1000);
      const m = String(Math.floor(diff / 60)).padStart(2, '0');
      const s = String(diff % 60).padStart(2, '0');
      uptimeEl.textContent = `${m}:${s}`;
    }, 1000);
  }

  /* Back to top button */
  const toTop = document.querySelector('.to-top');
  if(toTop){
    document.addEventListener('scroll', () => {
      toTop.classList.toggle('visible', window.scrollY > 480);
    }, { passive: true });
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

});
