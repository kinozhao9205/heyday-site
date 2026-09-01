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

  // Viewport-driven video playback + dynamic pan for long images/videos.
  // Videos carry preload="none" and no autoplay attribute in the HTML;
  // they only start fetching when scrolled near the viewport and pause when
  // scrolled far away. Critical on the Aliyun server whose outbound bandwidth
  // is ~2.2 Mbps: previously 16 concurrent autoplay videos starved image
  // downloads and made the team panorama never appear in Safari / WeChat.
  // Additionally, every poster and video is analysed: if it is wider or
  // taller than its fixed-aspect container, a slow pan animation scrolls the
  // full content into view instead of cropping or leaving blank borders.
  function initViewportVideos() {
    // Compute the fraction of the image/video that would be cropped by the
    // fixed-aspect container, then set a CSS variable-driven pan animation
    // whose distance and speed match the actual overflow.
    function applyPan(el, w, h) {
      const media = el.closest('.case-media, .more-media, .adv-image');
      if (!media || !w || !h) return;
      const cr = media.clientWidth / media.clientHeight;
      const r = w / h;
      el.classList.remove('pan-x', 'pan-y');
      el.style.removeProperty('--pan-shift');
      el.style.removeProperty('--pan-duration');

      if (r > cr * 1.01) {
        el.classList.add('pan-x');
        const renderedH = media.clientHeight;          // when height = 100%
        const renderedW = renderedH * r;
        const hidden = Math.max(0, renderedW - media.clientWidth) / renderedW;
        const shift = Math.min(Math.max(hidden, 0.10), 0.55);
        const dur = 8 + shift * 34;                      // ~8–27 s
        el.style.setProperty('--pan-shift', `-${(shift * 100).toFixed(1)}%`);
        el.style.setProperty('--pan-duration', `${dur.toFixed(1)}s`);
      } else if (r < cr / 1.05) {
        el.classList.add('pan-y');
        const renderedW = media.clientWidth;           // when width = 100%
        const renderedH = renderedW / r;
        const hidden = Math.max(0, renderedH - media.clientHeight) / renderedH;
        const shift = Math.min(Math.max(hidden, 0.10), 0.55);
        const dur = 8 + shift * 34;
        el.style.setProperty('--pan-shift', `-${(shift * 100).toFixed(1)}%`);
        el.style.setProperty('--pan-duration', `${dur.toFixed(1)}s`);
      }
    }

    function refreshPans() {
      document.querySelectorAll('.video-poster, video.pan-x, video.pan-y, .adv-image img').forEach((el) => {
        if (el.tagName === 'IMG' && el.complete && el.naturalWidth) {
          applyPan(el, el.naturalWidth, el.naturalHeight);
        }
      });
    }

    // Start poster pan as soon as the poster image is available, so even
    // before the video loads the long image scrolls instead of sitting cropped.
    document.querySelectorAll('.video-poster').forEach((img) => {
      if (img.complete && img.naturalWidth) {
        applyPan(img, img.naturalWidth, img.naturalHeight);
      } else {
        img.addEventListener('load', () => applyPan(img, img.naturalWidth, img.naturalHeight), { once: true });
      }
    });

    // Advantages card images: same dynamic pan treatment.
    document.querySelectorAll('.adv-image img').forEach((img) => {
      if (img.complete && img.naturalWidth) {
        applyPan(img, img.naturalWidth, img.naturalHeight);
      } else {
        img.addEventListener('load', () => applyPan(img, img.naturalWidth, img.naturalHeight), { once: true });
      }
    });

    // Re-apply pan based on real video dimensions and fade video over poster.
    document.querySelectorAll('video').forEach((v) => {
      const setVideoPan = () => {
        if (v.videoWidth && v.videoHeight) {
          applyPan(v, v.videoWidth, v.videoHeight);
          v.classList.add('is-loaded');
        }
      };
      if (v.readyState >= 1) setVideoPan();
      v.addEventListener('loadedmetadata', setVideoPan, { once: true });
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(refreshPans, 200);
    });

    // Viewport-driven play/pause
    const vids = document.querySelectorAll('video');
    if (!vids.length) return;

    const prep = (v) => {
      v.muted = true;
      v.playsInline = true;
      v.setAttribute('webkit-playsinline', '');
    };

    const tryPlay = (v) => {
      if (v.readyState >= 2) {
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      }
    };

    if (!('IntersectionObserver' in window)) {
      vids.forEach((v) => { prep(v); v.preload = 'metadata'; tryPlay(v); });
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const v = e.target;
        if (e.isIntersecting) {
          if (v.dataset.vpStarted) return;
          v.dataset.vpStarted = '1';
          v.preload = 'metadata';
          v.load();
          tryPlay(v);
          v.addEventListener('loadeddata', () => tryPlay(v), { once: true });
          v.addEventListener('canplay', () => tryPlay(v), { once: true });
          setTimeout(() => tryPlay(v), 400);
          setTimeout(() => tryPlay(v), 1500);
        } else if (v.dataset.vpStarted) {
          try { v.pause(); } catch (err) { /* ignore */ }
        }
      });
    }, { rootMargin: '300px 0px 300px 0px', threshold: 0.05 });

    vids.forEach((v) => { prep(v); io.observe(v); });
  }
  initViewportVideos();

  // Pause animated tickers when tab is hidden (saves battery / bandwidth)
  const logoTrack = document.querySelector('.pt-track-logos');
  if (logoTrack && !prefersReducedMotion) {
    document.addEventListener('visibilitychange', () => {
      logoTrack.style.animationPlayState = document.hidden ? 'paused' : 'running';
    });
  }

  // 3D tilt hover on desktop cards (disabled on touch devices)
  initTilt();

  // Case cards: expand/collapse detail bullets
  initCaseExpand();

  // Team group photo: default scroll position = center of the panorama,
  // so the most important part of the group shot is visible on load.
  initTeamPhotoCenter();
});

function initCaseExpand() {
  const casesSection = document.querySelector('.cases');
  if (!casesSection) return;

  const dictText = (key, fallback) => {
    try {
      const t = window.HEYDAY_I18N && window.HEYDAY_I18N.text(key);
      return t || fallback;
    } catch (e) {
      return fallback;
    }
  };

  casesSection.addEventListener('click', (e) => {
    const btn = e.target.closest('.case-toggle');
    if (!btn) return;
    const card = btn.closest('.case-card');
    if (!card) return;
    const label = btn.querySelector('span');
    const open = card.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (label) {
      label.textContent = open
        ? dictText('cs_less', 'Close')
        : dictText('cs_more', 'View details');
    }
  });
}

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
  const cards = document.querySelectorAll('.case-card, .adv-card, .more-card');
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
