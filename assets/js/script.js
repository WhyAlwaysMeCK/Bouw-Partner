const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#site-nav");
const navLinks = nav ? Array.from(nav.querySelectorAll("a")) : [];
const revealItems = Array.from(document.querySelectorAll(".is-reveal"));
const yearNodes = Array.from(document.querySelectorAll("[data-year]"));
const images = Array.from(document.images);

function enhanceImages() {
  images.forEach((image, index) => {
    const isHeaderImage = Boolean(image.closest(".site-header"));
    const hasExplicitLoading = image.hasAttribute("loading");
    const isEager = image.getAttribute("loading") === "eager";
    const shouldStayEager = isHeaderImage || isEager || index === 0;

    if (!image.hasAttribute("decoding")) {
      image.setAttribute("decoding", "async");
    }

    if (!hasExplicitLoading && !shouldStayEager) {
      image.setAttribute("loading", "lazy");
    }

    if (!image.hasAttribute("fetchpriority") && (isEager || index === 0) && !isHeaderImage) {
      image.setAttribute("fetchpriority", "high");
    }

    if (image.getAttribute("loading") === "lazy") {
      image.classList.add("media-lazy");

      const markLoaded = () => {
        image.classList.add("is-loaded");
      };

      if (image.complete) {
        markLoaded();
      } else {
        image.addEventListener("load", markLoaded, { once: true });
        image.addEventListener("error", markLoaded, { once: true });
      }
    }
  });
}

function closeMenu() {
  if (!header || !navToggle) {
    return;
  }

  header.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
}

if (navToggle && header) {
  navToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) {
      closeMenu();
    }
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeMenu();
  });
});

enhanceImages();

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

yearNodes.forEach((node) => {
  node.textContent = new Date().getFullYear();
});
