/* HEYDAY GROUP Official Website Scripts */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Preloader
  const preloader = document.getElementById('preloader');
  const plLogo = document.querySelector('.preloader-logo');
  const plText = document.querySelector('.preloader-text');

  const preloaderTL = gsap.timeline({
    onComplete: () => {
      gsap.to(preloader, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.inOut',
        onComplete: () => {
          preloader.style.display = 'none';
          initHeroAnimations();
        }
      });
    }
  });

  preloaderTL
    .fromTo(plLogo, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' })
    .to(plText, { opacity: 1, duration: 0.5 }, '-=0.3');

  // Navbar scroll behavior
  const navbar = document.getElementById('navbar');
  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Mobile menu
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      navToggle.classList.toggle('active');
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        if (navLinks) navLinks.classList.remove('active');
        if (navToggle) navToggle.classList.remove('active');
      }
    });
  });

  // Hero animations
  function initHeroAnimations() {
    const heroTL = gsap.timeline();
    heroTL
      .to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
      .to('.ht-line', { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power3.out' }, '-=0.4')
      .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
      .to('.hero-cta', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
      .to('.hero-scroll', { opacity: 1, duration: 0.8 }, '-=0.3');
  }

  // Hero canvas particle network
  initHeroCanvas();

  // Scroll reveal
  initScrollReveal();

  // Counter animation
  initCounters();

  // GSAP ScrollTrigger enhancements
  if (!prefersReducedMotion && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Timeline line draw
    gsap.to('.timeline-line span', {
      height: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: '.timeline-wrap',
        start: 'top 70%',
        end: 'bottom 70%',
        scrub: true
      }
    });

    // Hero parallax
    gsap.to('.hero-content', {
      y: -80,
      opacity: 0.3,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    gsap.to('.hero-beam', {
      x: 100,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  // Hero canvas particle network
  function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    let isActive = true;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particleCount = window.innerWidth < 768 ? 40 : 80;
    const connectionDistance = 140;
    const mouseDistance = 220;

    const mouse = { x: null, y: null };
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.size = Math.random() * 2 + 1;
        this.baseAlpha = Math.random() * 0.4 + 0.2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        // Mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseDistance) {
            const force = (mouseDistance - dist) / mouseDistance;
            this.vx += (dx / dist) * force * 0.02;
            this.vy += (dy / dist) * force * 0.02;
          }
        }

        // Damping
        this.vx *= 0.99;
        this.vy *= 0.99;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230, 0, 18, ${this.baseAlpha})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      if (!isActive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.25;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(230, 0, 18, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    }

    if (!prefersReducedMotion) {
      animate();
    } else {
      // Static composition for reduced motion
      particles.forEach(p => p.draw());
    }

    // Pause when tab hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isActive = false;
        cancelAnimationFrame(animationId);
      } else if (!prefersReducedMotion) {
        isActive = true;
        animate();
      }
    });
  }

  // Scroll reveal with IntersectionObserver
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');

    // Auto-stagger children inside grids so cards animate in sequence
    document.querySelectorAll('.cases-grid, .adv-grid, .more-grid, .ach-grid, .team-groups, .partners-cats').forEach(grid => {
      Array.from(grid.children).forEach((child, idx) => {
        if (child.classList.contains('reveal') && !child.dataset.delay) {
          child.dataset.delay = (idx % 6) * 0.08;
        }
      });
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activateReveal(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    // Fallback: fast scroll / anchor jump / in-app browsers can skip the IO
    // callback entirely, so also activate anything currently inside the viewport.
    const pending = Array.from(reveals);
    const activateReveal = (el) => {
      if (el.classList.contains('active')) return;
      const delay = el.dataset.delay ? parseFloat(el.dataset.delay) : 0;
      setTimeout(() => {
        if (!el.classList.contains('active')) el.classList.add('active');
      }, delay * 1000);
    };
    const activateInView = () => {
      for (let i = pending.length - 1; i >= 0; i--) {
        const el = pending[i];
        if (el.classList.contains('active')) { pending.splice(i, 1); continue; }
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 40 && rect.bottom > 0) {
          activateReveal(el);
          pending.splice(i, 1);
        }
      }
    };
    let rvTicking = false;
    window.addEventListener('scroll', () => {
      if (rvTicking) return;
      rvTicking = true;
      requestAnimationFrame(() => {
        activateInView();
        rvTicking = false;
      });
    }, { passive: true });

    reveals.forEach(el => observer.observe(el));
    // initial pass (above-the-fold + when landed via anchor)
    setTimeout(activateInView, 250);
  }

  // Counter animation (iOS/WeChat friendly: low threshold + scroll fallback)
  function initCounters() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    const run = (el) => {
      const target = parseInt(el.dataset.target, 10);
      if (!isNaN(target)) animateCounter(el, target);
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            run(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0 });

      counters.forEach(c => observer.observe(c));

      // Fallback: if IO never fires (e.g. in-app browsers / fast scroll),
      // force-run counters once the section scrolls near the bottom.
      let fallbackDone = false;
      const fallback = () => {
        if (fallbackDone) return;
        const doc = document.documentElement;
        const nearBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 400;
        if (nearBottom) {
          fallbackDone = true;
          counters.forEach(c => { run(c); observer.unobserve(c); });
          window.removeEventListener('scroll', fallback);
          window.removeEventListener('resize', fallback);
        }
      };
      window.addEventListener('scroll', fallback, { passive: true });
      window.addEventListener('resize', fallback, { passive: true });
      // Also check shortly after load in case the page opens at the bottom
      setTimeout(fallback, 2500);
    } else {
      // No IO support: just show final values
      counters.forEach(c => run(c));
    }
  }

  function animateCounter(el, target) {
    const duration = 2000;
    const startTime = performance.now();
    let done = false;

    // Render current eased value from elapsed time (idempotent for a given `now`)
    const render = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(easeProgress * target).toLocaleString();
      return progress;
    };
    const finish = () => {
      done = true;
      el.textContent = target.toLocaleString();
      el.classList.add('counter-flash');
      setTimeout(() => el.classList.remove('counter-flash'), 700);
    };

    const step = (now) => {
      if (done) return;
      if (render(now) < 1) requestAnimationFrame(step);
      else finish();
    };
    requestAnimationFrame(step);

    // Watchdog: iOS WebKit pauses/throttles requestAnimationFrame during long
    // scrolls and in WeChat's in-app browser. A timer keeps driving the
    // animation to completion so counters never freeze on "0".
    const wd = setInterval(() => {
      if (done) { clearInterval(wd); return; }
      if (render(performance.now()) >= 1) finish();
    }, 100);
  }

  // Video autoplay helper — native src in HTML now; here we only retry
  // playback until it succeeds (handles iOS Safari / WeChat quirks where
  // autoplay can fail while data is still buffering).
  const pageVideos = document.querySelectorAll('video');
  pageVideos.forEach((v, i) => {
    // Ensure inline playback props are set (belt & braces)
    v.muted = true;
    v.playsInline = true;
    v.setAttribute('webkit-playsinline', '');

    const tryPlay = () => {
      if (v.readyState >= 2) {
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      }
    };
    v.addEventListener('loadeddata', tryPlay, { once: true });
    v.addEventListener('canplay', tryPlay, { once: true });
    // Staggered retry (300ms + index*200ms) — also avoids all videos
    // competing for bandwidth at the same instant on slow servers.
    setTimeout(tryPlay, 300 + i * 200);
    setTimeout(tryPlay, 2000 + i * 300);
  });

  // Pause animated tickers when tab is hidden (saves battery / bandwidth)
  const logoTrack = document.querySelector('.pt-track-logos');
  if (logoTrack && !prefersReducedMotion) {
    document.addEventListener('visibilitychange', () => {
      logoTrack.style.animationPlayState = document.hidden ? 'paused' : 'running';
    });
  }

  // 3D tilt hover on desktop cards (disabled on touch devices)
  initTilt();

  // Team group photo: default scroll position = center of the panorama,
  // so the most important part of the group shot is visible on load.
  initTeamPhotoCenter();
});

function initTeamPhotoCenter() {
  const frame = document.querySelector('.team-photo-frame');
  if (!frame) return;
  const img = frame.querySelector('img');
  let userScrolled = false;

  frame.addEventListener('scroll', () => { userScrolled = true; }, { passive: true });

  const center = () => {
    const max = frame.scrollWidth - frame.clientWidth;
    if (max > 0) {
      frame.scrollLeft = max / 2;
      return true;
    }
    return false;
  };

  // Wait until the wide panorama is loaded (scrollWidth depends on it),
  // then center once. Guard with a deadline so a failed image never loops.
  const deadline = Date.now() + 8000;
  const tryCenter = () => {
    if (center()) return;
    if (Date.now() > deadline) return;
    requestAnimationFrame(tryCenter);
  };

  if (img && img.complete && img.naturalWidth > 0) {
    tryCenter();
  } else if (img) {
    img.addEventListener('load', tryCenter, { once: true });
    requestAnimationFrame(tryCenter);
  } else {
    tryCenter();
  }

  // Keep centered across orientation / resize changes unless the user
  // has manually scrolled the panorama.
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (!userScrolled) center(); }, 200);
  });
}

function initTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const cards = document.querySelectorAll('.case-card, .adv-card, .more-card, .ach-card');
  cards.forEach(card => {
    card.classList.add('tilt-card');
    const shine = document.createElement('div');
    shine.className = 'tilt-shine';
    if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
    card.appendChild(shine);

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rx = ((y - cy) / cy) * -8;
      const ry = ((x - cx) / cx) * 8;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}
