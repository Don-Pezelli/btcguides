document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  // ===== Top nav (index/glossary/etc) =====
  const topBtn = document.querySelector(".menu-toggle-top");
  const topNav = document.getElementById("site-nav");

  function closeTopNav() {
    body.classList.remove("topnav-open");
    if (topBtn) topBtn.setAttribute("aria-expanded", "false");
  }

  if (topBtn && topNav) {
    topBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      // close guide if open
      body.classList.remove("guide-nav-open");
      const isOpen = body.classList.toggle("topnav-open");
      topBtn.setAttribute("aria-expanded", String(isOpen));
    });

    // click outside closes
    document.addEventListener("click", (e) => {
      if (!body.classList.contains("topnav-open")) return;
      if (!topNav.contains(e.target) && e.target !== topBtn) closeTopNav();
    });
  }

  // ===== Guide sidebar =====
  const guideBtn = document.querySelector(".menu-toggle-guide");
  const guideNav =
  document.getElementById("basic_utility_level_1_navbar") ||
  document.querySelector(".guide-navbar");
  const backdrop = document.querySelector(".nav-backdrop");

  function openGuide() {
    body.classList.add("guide-nav-open");
    if (guideBtn) guideBtn.setAttribute("aria-expanded", "true");
    if (backdrop) backdrop.hidden = false;
  }
  function closeGuide() {
    body.classList.remove("guide-nav-open");
    if (guideBtn) guideBtn.setAttribute("aria-expanded", "false");
    if (backdrop) backdrop.hidden = true;
  }

  if (guideBtn && guideNav) {
    guideBtn.addEventListener("click", () => {
      // close top nav if open
      closeTopNav();
      if (body.classList.contains("guide-nav-open")) closeGuide();
      else openGuide();
    });

    if (backdrop) backdrop.addEventListener("click", closeGuide);
  }

  // Esc closes anything
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeTopNav();
      closeGuide();
    }
  });

  // If resized to desktop, close menus (prevents stuck states)
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) {
      closeTopNav();
      closeGuide();
    }
  });
});
