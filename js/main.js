// main.js — Ostéo et Coaching du Sport
// 1. Navbar scroll effect
// 2. Hero parallax (mousemove, 6 layers)
// 3. Scroll reveal (IntersectionObserver)

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initParallax();
  initScrollReveal();
});

function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}
function initParallax() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  const layers = {
    clouds: document.getElementById('hero-clouds'),
    ground: document.getElementById('hero-ground'),
    tree:   document.getElementById('hero-tree'),
    center: document.getElementById('hero-center'),
    statL:  document.getElementById('hero-stat-left'),
    statR:  document.getElementById('hero-stat-right'),
  };

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top)  / rect.height - 0.5;

    layers.clouds.style.transform = `translate(${cx * 20}px, ${cy * 8}px)`;
    layers.ground.style.transform = `translate(${cx * 8}px, ${cy * 5}px)`;
    layers.tree.style.transform   = `translate(${cx * -32}px, ${cy * -20}px)`;
    layers.center.style.transform = `translate(calc(-50% + ${cx * 5}px), calc(-50% + ${cy * 3}px))`;
    layers.statL.style.transform  = `translate(${cx * -10}px, ${cy * -6}px)`;
    layers.statR.style.transform  = `translate(${cx * -14}px, ${cy * -8}px)`;
  }, { passive: true });

  hero.addEventListener('mouseleave', () => {
    layers.clouds.style.transform = '';
    layers.ground.style.transform = '';
    layers.tree.style.transform   = '';
    layers.center.style.transform = 'translate(-50%, -50%)';
    layers.statL.style.transform  = '';
    layers.statR.style.transform  = '';
  });
}
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
    .forEach(el => observer.observe(el));
}
