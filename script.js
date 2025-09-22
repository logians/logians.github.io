var camera, scene, renderer;
var earth, cloud, glow;
var mouseDown = false, mouseX = 0, mouseY = 0;

init();
animate();

function init() {
  scene = new THREE.Scene();

  // Renderer dulu
  const container = document.getElementById("earth-container");
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight, false);

  // Camera pakai container aspect
  camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    1,
    1000
  );
  camera.position.z = 180;

  // Earth
  const earth_texture = new THREE.TextureLoader().load("https://i.postimg.cc/ry0pcyyZ/earth.jpg");
  const earth_bump = new THREE.TextureLoader().load("https://i.postimg.cc/mgrJfkBt/bump.jpg");
  const earth_specular = new THREE.TextureLoader().load("https://i.postimg.cc/R06YhY3m/spec.jpg");

  const earth_geometry = new THREE.SphereGeometry(30, 64, 64);
  const earth_material = new THREE.MeshPhongMaterial({
    shininess: 40,
    bumpScale: 1,
    map: earth_texture,
    bumpMap: earth_bump,
    specularMap: earth_specular
  });
  earth = new THREE.Mesh(earth_geometry, earth_material);
  scene.add(earth);

  // Clouds
  const cloud_texture = new THREE.TextureLoader().load("https://i.postimg.cc/k4WhFtFh/cloud.png");
  const cloud_geometry = new THREE.SphereGeometry(31, 64, 64);
  const cloud_material = new THREE.MeshPhongMaterial({
    map: cloud_texture,
    transparent: true,
    opacity: 0.4,
    depthWrite: false
  });
  cloud = new THREE.Mesh(cloud_geometry, cloud_material);
  scene.add(cloud);

  // Lights
  const pointLight = new THREE.PointLight(0xffffff, 1.2);
  pointLight.position.set(-400, 100, 150);
  scene.add(pointLight);
  scene.add(new THREE.AmbientLight(0x222222));

  // Glow / Atmosphere
  const glow_geometry = new THREE.SphereGeometry(33, 64, 64); // Radius diperbesar dari 33 ke 34
  const glow_material = new THREE.ShaderMaterial({
    uniforms: {
      "c": { type: "f", value: 0.5 },
      "p": { type: "f", value: 2.0 }, // Dikurangi dari 4.0 ke 2.0 untuk glow lebih tebal
      glowColor: { type: "c", value: new THREE.Color(0x00aaff) },
      viewVector: { type: "v3", value: camera.position }
    },
    vertexShader: `
      uniform vec3 viewVector;
      uniform float c;
      uniform float p;
      varying float intensity;
      void main() {
        vec3 vNormal = normalize(normalMatrix * normal);
        vec3 vNormel = normalize(normalMatrix * viewVector);
        intensity = pow(c - dot(vNormal, vNormel), p);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      varying float intensity;
      void main() {
        vec3 glow = glowColor * intensity;
        gl_FragColor = vec4(glow, 1.0);
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true
  });
  glow = new THREE.Mesh(glow_geometry, glow_material);
  scene.add(glow);

  // Append renderer
  document.getElementById("earth-container").appendChild(renderer.domElement);

  // Panggil resize untuk sync
  onWindowResize();

  // Events
  window.addEventListener("resize", onWindowResize, false);
  document.addEventListener("mousemove", onMouseMove, false);
  document.addEventListener("mousedown", onMouseDown, false);
  document.addEventListener("mouseup", onMouseUp, false);
}

function animate() {
  requestAnimationFrame(animate);
  earth.rotation.y += 0.001;
  cloud.rotation.y += 0.001;

  // Update glow supaya selalu menghadap kamera
  glow.material.uniforms.viewVector.value =
    new THREE.Vector3().subVectors(camera.position, earth.position);

  renderer.render(scene, camera);
}

function onWindowResize() {
  const container = document.getElementById("earth-container");
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height, false);
}

function onMouseMove(evt) {
  if (!mouseDown) return;
  evt.preventDefault();
  var deltaX = evt.clientX - mouseX,
      deltaY = evt.clientY - mouseY;
  mouseX = evt.clientX;
  mouseY = evt.clientY;
  rotateScene(deltaX, deltaY);
}

function onMouseDown(evt) {
  evt.preventDefault();
  mouseDown = true;
  mouseX = evt.clientX;
  mouseY = evt.clientY;
}

function onMouseUp(evt) {
  evt.preventDefault();
  mouseDown = false;
}

function rotateScene(deltaX, deltaY) {
  earth.rotation.y += deltaX / 300;
  earth.rotation.x += deltaY / 300;
  cloud.rotation.y += deltaX / 300;
  cloud.rotation.x += deltaY / 300;
}

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

let astronautSide = 'center';

function toggleAstronautSide() {
  const astronautImage = document.getElementById('astronautImage');
  if (!astronautImage) return;

  // cuma jalan di tablet & hp
  if (window.innerWidth <= 992) {
    if (astronautSide === 'left') {
      astronautImage.style.left = '70%'; // pindah kanan
      astronautSide = 'right';
    } else {
      astronautImage.style.left = '30%'; // pindah kiri
      astronautSide = 'left';
    }
  } else {
    // desktop biarin default (kanan)
    astronautImage.style.left = '75%';
    astronautSide = 'center';
  }
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
  toggleAstronautSide();
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