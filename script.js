const root = document.documentElement;
root.classList.add("has-js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const intro = document.querySelector("#build-intro");
const skipIntro = document.querySelector("#skip-intro");
let introClosed = false;

function closeIntro() {
  if (introClosed) return;
  introClosed = true;
  root.classList.add("is-entered");
  intro.classList.add("is-leaving");
  window.setTimeout(() => intro.remove(), reduceMotion ? 80 : 620);
}

skipIntro.addEventListener("click", closeIntro);
window.setTimeout(closeIntro, reduceMotion ? 30 : 2070);

const header = document.querySelector(".header");
const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector("#navigation");
const heroVideo = document.querySelector("#hero-video");
const videoToggle = document.querySelector("#video-toggle");

const scheduleTable = document.querySelector(".schedule-table");
const mobileSchedule = document.querySelector(".schedule__mobile");
if (scheduleTable && mobileSchedule) {
  const days = [...scheduleTable.querySelectorAll("thead th")].slice(1).map((cell) => cell.textContent.trim());
  const rows = [...scheduleTable.querySelectorAll("tbody tr")];
  days.forEach((day, dayIndex) => {
    const card = document.createElement("article");
    card.className = "schedule-day";
    const title = document.createElement("h3");
    title.textContent = day;
    const list = document.createElement("ul");
    const lessons = rows.flatMap((row) => {
      const time = row.querySelector("th").textContent.trim();
      const lesson = row.querySelectorAll("td")[dayIndex].textContent.trim();
      return lesson === "—" ? [] : [{ time, lesson }];
    });
    const total = document.createElement("small");
    total.textContent = `${String(lessons.length).padStart(2, "0")} AULAS`;
    title.append(total);
    lessons.forEach(({ time, lesson }) => {
      const item = document.createElement("li");
      const timeLabel = document.createElement("time");
      const classLabel = document.createElement("span");
      timeLabel.textContent = time;
      classLabel.textContent = lesson;
      item.append(timeLabel, classLabel);
      list.append(item);
    });
    card.append(title, list);
    mobileSchedule.append(card);
  });
}

header.classList.add("is-drawn");

function setMenu(open) {
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.querySelector(".sr-only").textContent = open ? "Fechar menu" : "Abrir menu";
  navigation.classList.toggle("is-open", open);
}

menuButton.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

function syncVideoButton() {
  const paused = heroVideo.paused;
  videoToggle.setAttribute("aria-label", paused ? "Reproduzir vídeo de fundo" : "Pausar vídeo de fundo");
  videoToggle.querySelector(".video-toggle__icon").textContent = paused ? "▶" : "Ⅱ";
  videoToggle.querySelector(".video-toggle__text").textContent = paused ? "REPRODUZIR VÍDEO" : "PAUSAR VÍDEO";
}

videoToggle.addEventListener("click", async () => {
  if (heroVideo.paused) {
    try { await heroVideo.play(); } catch { /* The poster remains visible when playback is unavailable. */ }
  } else {
    heroVideo.pause();
  }
  syncVideoButton();
});
heroVideo.addEventListener("play", syncVideoButton);
heroVideo.addEventListener("pause", syncVideoButton);
if (reduceMotion) {
  heroVideo.pause();
  document.querySelectorAll(".gallery__video video, .structure-map__core video").forEach((video) => video.pause());
  syncVideoButton();
}

const progress = document.querySelector("#scroll-progress");
let scrollFrame = false;

function updateScroll() {
  const maximum = document.documentElement.scrollHeight - window.innerHeight;
  const percent = maximum > 0 ? Math.max(0, Math.min(100, window.scrollY / maximum * 100)) : 0;
  progress.style.width = `${percent}%`;
  header.classList.toggle("is-sticky", window.scrollY > 48);
  scrollFrame = false;
}

window.addEventListener("scroll", () => {
  if (!scrollFrame) {
    scrollFrame = true;
    window.requestAnimationFrame(updateScroll);
  }
}, { passive: true });
updateScroll();

const revealItems = [...document.querySelectorAll("[data-reveal]")];
const drawGroup = document.querySelector("[data-draw-group]");
if (drawGroup) revealItems.push(drawGroup);

if ("IntersectionObserver" in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -26px 0px" });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-revealed"));
}

const sectionIds = ["inicio", "academia", "treinos", "estrutura", "resultados", "contato"];
const navLinks = [...document.querySelectorAll(".navigation__link")];
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!current) return;
    navLinks.forEach((link) => link.classList.toggle("is-current", link.getAttribute("href") === `#${current.target.id}`));
  }, { threshold: [0.16, 0.38, 0.62], rootMargin: "-18% 0px -53% 0px" });
  sectionIds.forEach((id) => {
    const section = document.getElementById(id);
    if (section) sectionObserver.observe(section);
  });
}

const lightbox = document.querySelector("#lightbox");
const lightboxImage = lightbox.querySelector("img");
const lightboxVideo = lightbox.querySelector("video");
const lightboxCaption = lightbox.querySelector("p");

document.querySelectorAll("[data-lightbox]").forEach((button) => {
  button.addEventListener("click", () => {
    lightboxVideo.pause();
    lightboxVideo.hidden = true;
    lightboxImage.hidden = false;
    lightboxImage.src = button.dataset.lightbox;
    lightboxImage.alt = button.dataset.alt || "";
    lightboxCaption.textContent = button.dataset.alt || "";
    lightbox.showModal();
  });
});

document.querySelector("[data-video-view]").addEventListener("click", async () => {
  lightboxImage.hidden = true;
  lightboxVideo.hidden = false;
  lightboxVideo.currentTime = 0;
  lightboxCaption.textContent = "Academia Silva · João Pessoa";
  lightbox.showModal();
  try { await lightboxVideo.play(); } catch { /* User can start playback with the native controls. */ }
});

lightbox.querySelector(".lightbox__close").addEventListener("click", () => lightbox.close());
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});
lightbox.addEventListener("close", () => {
  lightboxVideo.pause();
  lightboxVideo.currentTime = 0;
});

const cursor = document.querySelector("#cursor");
if (window.matchMedia("(pointer: fine)").matches && !reduceMotion) {
  let pointerFrame = false;
  let pointerX = 0;
  let pointerY = 0;
  window.addEventListener("mousemove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!pointerFrame) {
      pointerFrame = true;
      window.requestAnimationFrame(() => {
        cursor.style.left = `${pointerX}px`;
        cursor.style.top = `${pointerY}px`;
        pointerFrame = false;
      });
    }
    cursor.classList.add("is-visible");
  }, { passive: true });
  document.addEventListener("mouseleave", () => cursor.classList.remove("is-visible"));
  document.querySelectorAll("a,button").forEach((element) => {
    element.addEventListener("mouseenter", () => {
      cursor.querySelector("span").textContent = element.matches(".gallery-item") ? "VIEW" : "GO";
      cursor.classList.toggle("is-view", element.matches(".gallery-item"));
      cursor.classList.toggle("is-go", !element.matches(".gallery-item"));
    });
    element.addEventListener("mouseleave", () => cursor.classList.remove("is-view", "is-go"));
  });
}

document.querySelector("#year").textContent = new Date().getFullYear();
