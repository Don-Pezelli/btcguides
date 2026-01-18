const headings = document.querySelectorAll("h1[id], h2[id], h3[id]");
const navLinks = document.querySelectorAll(".guide-nav-link, .sub-link");

const topBtn = document.querySelector('.menu-toggle-top'); // separate button in header
topBtn?.addEventListener('click', () => document.body.classList.toggle('topnav-open'));

function updateActive() {
  let closestHeading = null;
  let minDistance = Infinity;

  headings.forEach(h => {
    const rect = h.getBoundingClientRect();
    const distance = Math.abs(rect.top);
    if (distance < minDistance && rect.top <= window.innerHeight) {
      minDistance = distance;
      closestHeading = h;
    }
  });

  if (!closestHeading) return;

  // Remove all active classes first
  navLinks.forEach(link => link.classList.remove("active"));

  const id = closestHeading.getAttribute("id");

  // Highlight current heading (sub or top-level)
  const activeLink = document.querySelector(`.guide-nav-link[href="#${id}"], .sub-link[href="#${id}"]`);
  if (activeLink) activeLink.classList.add("active");

  // Find the closest previous h1 in document order
  if (closestHeading.tagName !== "H1") {
    let parentH1 = null;
    for (let i = 0; i < headings.length; i++) {
      if (headings[i] === closestHeading) break;
      if (headings[i].tagName === "H1") parentH1 = headings[i];
    }

    if (parentH1 && parentH1.id) {
      const parentLink = document.querySelector(`.guide-nav-link[href="#${parentH1.id}"]`);
      if (parentLink) parentLink.classList.add("active");
    }
  }
}
// Run on page load
updateActive();

// Run on scroll
window.addEventListener("scroll", updateActive);
