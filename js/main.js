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
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay ? parseFloat(entry.target.dataset.delay) : index * 0.05;
          setTimeout(() => {
            entry.target.classList.add('active');
          }, delay * 1000);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    reveals.forEach(el => observer.observe(el));
  }

  // Counter animation
  function initCounters() {
    const counters = document.querySelectorAll('.counter');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = parseInt(counter.dataset.target, 10);
          animateCounter(counter, target);
          observer.unobserve(counter);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
  }

  function animateCounter(el, target) {
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeProgress * (target - start) + start);
      el.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // Lazy-load videos with IntersectionObserver (bandwidth-friendly)
  const lazyVideos = document.querySelectorAll('video[data-src]');
  if ('IntersectionObserver' in window && lazyVideos.length) {
    const videoIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const v = entry.target;
        if (entry.isIntersecting) {
          if (!v.src) {
            v.src = v.dataset.src;
            v.load();
            v.play().catch(() => {});
          }
          videoIO.unobserve(v);
        }
      });
    }, { rootMargin: '200px 0px' });
    lazyVideos.forEach((v) => videoIO.observe(v));
  } else {
    lazyVideos.forEach((v) => { v.src = v.dataset.src; });
  }
});
