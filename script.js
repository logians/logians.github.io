// Utility: throttle
function throttle(fn, limit) {
  let waiting = false;
  return function (...args) {
    if (!waiting) {
      fn.apply(this, args);
      waiting = true;
      setTimeout(() => (waiting = false), limit);
    }
  };
}

// Create stars (lebih banyak & merata)
function createStars(num = 200) {
  const starsContainer = document.querySelector('.stars');
  if (!starsContainer) return;
  starsContainer.innerHTML = '';

  const gridSize = Math.sqrt(num); // akar untuk buat grid
  const stepX = 100 / gridSize;
  const stepY = 100 / gridSize;

  for (let gx = 0; gx < gridSize; gx++) {
    for (let gy = 0; gy < gridSize; gy++) {
      const star = document.createElement('div');
      star.className = 'star';
      // posisi dalam grid, lalu acak sedikit
      const x = gx * stepX + Math.random() * stepX;
      const y = gy * stepY + Math.random() * stepY;
      star.style.left = `${x}%`;
      star.style.top = `${y}%`;

      const size = Math.random() * 2 + 0.8;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.opacity = (Math.random() * 0.7 + 0.3).toFixed(2);
      star.style.animationDelay = (Math.random() * 3).toFixed(2) + 's';
      starsContainer.appendChild(star);
    }
  }
}


// Create comet (sekali jatuh di awal)
function createComet() {
  const comet = document.createElement('div');
  comet.className = 'comet';

  // titik awal acak (kanan atas)
  const startX = window.innerWidth * (0.6 + Math.random() * 0.4); // 60%-100% layar
  // titik akhir acak (kiri bawah)
  const endX = window.innerWidth * (Math.random() * 0.3); // 0%-30% layar

  comet.style.setProperty('--start-x', startX + 'px');
  comet.style.setProperty('--end-x', endX + 'px');

  document.body.appendChild(comet);

  setTimeout(() => comet.remove(), 3500);
}

function spawnComets(count = 3, interval = 2500) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      createComet();
    }, i * interval);
  }
}

// Typing text
const typingTexts = [
  "Kami menyediakan jasa Desain Grafis dari pembuatan logo, banner, flyer, brosur, id card.",
  "Kami menyediakan jasa Web Design sesuai kebutuhan anda dengan UI/UX modern.",
  "Jadikan momen penting anda dan bisnis anda menjadi profesional.",
  "Kami ingin berguna bagi semua orang dengan cara mendesain, membangun, dan berinovasi."
];
let typingIndex = 0, charIndex = 0, deleting = false;

function typeLoop() {
  const el = document.getElementById('typingText');
  if (!el) return;

  const current = typingTexts[typingIndex];

  if (!deleting) {
    charIndex++;
    el.innerHTML = current.slice(0, charIndex) + '<span class="cursor"></span>';
    if (charIndex === current.length) {
      setTimeout(() => (deleting = true), 1600);
    } else {
      setTimeout(typeLoop, 80);
    }
  } else {
    charIndex--;
    el.innerHTML = current.slice(0, charIndex) + '<span class="cursor"></span>';
    if (charIndex === 0) {
      deleting = false;
      typingIndex = (typingIndex + 1) % typingTexts.length;
      setTimeout(typeLoop, 400);
    } else {
      setTimeout(typeLoop, 40);
    }
  }
}

// Astronaut random move tiap klik nav
function moveAstronautOnNav() {
  const astronautImage = document.getElementById('astronautImage');
  if (!astronautImage) return;

  const randX = Math.floor(Math.random() * 80) - 40; // -40..40
  const randY = Math.floor(Math.random() * 40) - 20; // -20..20

  astronautImage.style.setProperty('--ax', `calc(-50% + ${randX}px)`);
  astronautImage.style.setProperty('--ay', `calc(-50% + ${randY}px)`);
}

// Navigation
function navigateToSection(sectionId, clickedElement) {
  document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
  if (clickedElement) clickedElement.classList.add('active');

  document.querySelectorAll('.hero, .section').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.add('active');
    const header = document.querySelector('header');
    const offset = header ? header.offsetHeight + 10 : 0;
    const topPos = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: topPos, behavior: 'smooth' });
  }

  moveAstronautOnNav();
}

// Mousemove parallax
function enableMouseParallax() {
  const astronautImage = document.getElementById('astronautImage');
  const planetLayer = document.getElementById('planetLayer');
  const milkyWay = document.querySelector('.milky-way');
  const stars = document.querySelector('.stars');

  window.addEventListener('mousemove', throttle((e) => {
    const w = window.innerWidth, h = window.innerHeight;
    const dx = (e.clientX - w / 2) / (w / 2);
    const dy = (e.clientY - h / 2) / (h / 2);

    if (planetLayer) {
      planetLayer.style.transform = `translateX(${(-dx) * 15}px) translateY(${(-dy) * 8}px)`;
    }

    if (astronautImage) {
      astronautImage.style.setProperty('--ax', `calc(-50% + ${dx * 10}px)`);
      astronautImage.style.setProperty('--ay', `calc(-50% + ${dy * 8}px)`);
    }

    if (milkyWay) {
      milkyWay.style.transform = `rotate(-15deg) translateX(${dx * 25}px) translateY(${dy * 10}px)`;
    }

    if (stars) {
      stars.style.transform = `translateX(${dx * 12}px) translateY(${dy * 6}px)`;
    }
  }, 16));
}

// Scroll parallax
function enableScrollParallax() {
  const milkyWay = document.querySelector('.milky-way');
  const stars = document.querySelector('.stars');
  const planetLayer = document.getElementById('planetLayer');
  window.addEventListener('scroll', throttle(() => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.15;
    if (milkyWay) milkyWay.style.transform = `rotate(-15deg) translateX(${100 + rate}px)`;
    if (stars) stars.style.transform = `translateY(${rate * 0.6}px)`;
    if (planetLayer) planetLayer.style.transform = `translateY(${scrolled * -0.03}px)`;
  }, 20));
}

// Nav listeners
function attachNavListeners() {
  const allLinks = document.querySelectorAll('nav a[data-section], .btn[data-section]');
  allLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const section = this.getAttribute('data-section');
      if (section) navigateToSection(section, this);
    });
  });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  createStars(window.innerWidth > 1400 ? 200 : 150);
  attachNavListeners();
  enableMouseParallax();
  enableScrollParallax();

  // Hero langsung tampil
  const hero = document.querySelector('.hero');
  if (hero) hero.classList.add('active');

  // Tambah komet jatuh di awal
  setTimeout(() => spawnComets(3, 5500), 800);

  // Animasi ketik setelah semua resource siap
  window.addEventListener('load', () => {
    const el = document.getElementById('typingText');
    if (el) el.innerHTML = ''; // hapus fallback text
    setTimeout(() => {
      typeLoop();
    }, 300);
  });
});
