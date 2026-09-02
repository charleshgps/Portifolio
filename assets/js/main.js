import { projetos } from "./projetos.js";

const navigation = document.querySelector("#navigation");
const backToTopButton = document.querySelector("#backToTopButton");
const toggle = document.querySelector("#sw-checkbox");
const projectsSection = document.querySelector("#projects .wrapper");
const scrollProgress = document.querySelector("#scrollProgress");

// Respeita a preferência do usuário por menos movimento e só liga os efeitos
// que dependem de mouse (tilt, magnético, parallax) em dispositivos com
// ponteiro fino (mouse/trackpad) — não faz sentido em touch.
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;
const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
const canAnimate = !prefersReducedMotion && hasFinePointer;

const notebook_1 = document.querySelector("#notebook-1");
const notebook_2 = document.querySelector("#notebook-2");
const notebook_2_white = document.querySelector("#notebook-2-white");
// #vidro está comentado em index.html (efeito desativado), por isso não é lido aqui.

window.addEventListener("load", function begin() {
  projetos(projectsSection);

  // Os cards de projeto só existem no DOM a partir daqui, então o tilt e o
  // scroll reveal em cascata deles têm que ser ligados aqui dentro.
  enhanceCards("#projects .card");
  if (!prefersReducedMotion) {
    ScrollReveal().reveal("#projects .card", {
      origin: "bottom",
      distance: "30px",
      duration: 600,
      interval: 90,
    });
  }
});

const currentYear = document.querySelector("#currentYear");
currentYear.textContent = new Date().getFullYear();

window.addEventListener("scroll", onScroll);
onScroll();

setTimeout(() => {
  notebook_1.style.opacity = 0;

  notebook_1.style.animation = "none";
  notebook_2.style.animation = "none";
  notebook_2_white.style.animation = "none";
}, 4000);

function onScroll() {
  showNavOnScroll();
  showBackToTopButtonOnScroll();
  updateScrollProgress();

  activateMenuAtCurrentSection(about);
  activateMenuAtCurrentSection(projects);
  activateMenuAtCurrentSection(knowledge);
  activateMenuAtCurrentSection(contact);
}

function activateMenuAtCurrentSection(section) {
  const targetLine = scrollY + innerHeight / 2;
  const sectionTop = section.offsetTop;
  const sectionHeight = section.offsetHeight;

  const sectionTopReachOrPassedTargetLine = targetLine >= sectionTop;
  const sectionEndsAt = sectionTop + sectionHeight;
  const sectionEndPassedTargetLine = sectionEndsAt <= targetLine;

  const sectionBoundaries =
    sectionTopReachOrPassedTargetLine && !sectionEndPassedTargetLine;

  const sectionId = section.getAttribute("id");
  const menuElement = document.querySelector(`.menu a[href*=${sectionId}]`);

  menuElement.classList.remove("active");

  if (sectionBoundaries) {
    menuElement.classList.add("active");
  }
}

function showNavOnScroll() {
  if (scrollY > 0) {
    navigation.classList.add("scroll");
  } else {
    navigation.classList.remove("scroll");
  }
}

function showBackToTopButtonOnScroll() {
  if (scrollY > 550) {
    backToTopButton.classList.add("show");
  } else {
    backToTopButton.classList.remove("show");
  }
}

function updateScrollProgress() {
  if (!scrollProgress) return;

  const scrollable = document.documentElement.scrollHeight - innerHeight;
  const progress = scrollable > 0 ? (scrollY / scrollable) * 100 : 0;

  scrollProgress.style.width = `${progress}%`;
}

openMenu();
function openMenu() {
  const openBtns = document.querySelectorAll(".open");
  openBtns.forEach((e) => {
    e.addEventListener("click", () => {
      document.body.classList.add("menu-expanded");
    });
  });
}

closeMenu();
function closeMenu() {
  const closeBtns = document.querySelectorAll(".close");
  closeBtns.forEach((e) => {
    e.addEventListener("click", () => {
      document.body.classList.remove("menu-expanded");
    });
  });
}

ScrollReveal({
  origin: "bottom",
  distance: "50px",
  duration: 1000,
}).reveal(
  `#home,
  #home img,
  #about,
  #about header,
  #about p,
  #about img,
  #projects,
  #projects header,
  #knowledge,
  #knowledge header,
  #contact,
  #contact header`
);

// Os cards de Conhecimentos já existem no HTML, então dá pra revelar em
// cascata direto (os de Projetos são revelados dentro de begin(), acima,
// assim que são inseridos no DOM).
if (!prefersReducedMotion) {
  ScrollReveal().reveal("#knowledge .card", {
    origin: "bottom",
    distance: "30px",
    duration: 600,
    interval: 90,
  });
}

toggle.addEventListener("change", () => {
  document.body.classList.toggle("light-mode");
});

/*===== SPOTLIGHT + TILT NOS CARDS ================================*/

function enhanceCard(card) {
  function onMove(e) {
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const rotateY = (px - 0.5) * 12;
    const rotateX = (0.5 - py) * 12;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    card.style.setProperty("--x", `${px * 100}%`);
    card.style.setProperty("--y", `${py * 100}%`);
  }

  function onLeave() {
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
  }

  card.addEventListener("mousemove", onMove);
  card.addEventListener("mouseleave", onLeave);
}

function enhanceCards(selector) {
  if (!canAnimate) return;
  document.querySelectorAll(selector).forEach(enhanceCard);
}

enhanceCards("#knowledge .card");

/*===== BOTÕES MAGNÉTICOS ==========================================*/

function enhanceMagneticButtons() {
  if (!canAnimate) return;

  document.querySelectorAll(".button").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);

      btn.style.transform = `translate(${relX / 6}px, ${relY / 6}px)`;
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });
}

enhanceMagneticButtons();

/*===== PARALLAX DO BLOB NA HOME ===================================*/

function initBlobParallax() {
  if (!canAnimate) return;

  const home = document.querySelector("#home");
  const heroWrapper = document.querySelector("#home .wrapper");
  if (!home || !heroWrapper) return;

  home.addEventListener("mousemove", (e) => {
    const rect = home.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;

    heroWrapper.style.setProperty("--blob-x", `${px * 24}px`);
    heroWrapper.style.setProperty("--blob-y", `${py * 24}px`);
  });

  home.addEventListener("mouseleave", () => {
    heroWrapper.style.setProperty("--blob-x", "0px");
    heroWrapper.style.setProperty("--blob-y", "0px");
  });
}

initBlobParallax();

/*===== TEXT SCRAMBLE NO TÍTULO ====================================*/

class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = "!<>-_\\/[]{}—=+*^?#$%&";
    this.frame = 0;
    this.queue = [];
    this.frameRequest = null;
  }

  setText(newText) {
    const oldText = this.el.textContent;
    const length = Math.max(oldText.length, newText.length);

    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * 20);
      const end = start + Math.floor(Math.random() * 20) + 10;
      this.queue.push({ from, to, start, end });
    }

    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
  }

  update() {
    let output = "";
    let complete = 0;

    for (let i = 0; i < this.queue.length; i++) {
      const item = this.queue[i];

      if (this.frame >= item.end) {
        complete++;
        output += item.to;
      } else if (this.frame >= item.start) {
        if (!item.char || Math.random() < 0.28) {
          item.char = this.chars[Math.floor(Math.random() * this.chars.length)];
        }
        output += `<span class="scramble-char">${item.char}</span>`;
      } else {
        output += item.from;
      }
    }

    this.el.innerHTML = output;

    if (complete === this.queue.length) return;

    this.frameRequest = requestAnimationFrame(() => this.update());
    this.frame++;
  }
}

function initHeadlineScramble() {
  if (prefersReducedMotion) return;

  const headline = document.querySelector("#home h1");
  if (!headline) return;

  new TextScramble(headline).setText(headline.textContent);
}

initHeadlineScramble();
