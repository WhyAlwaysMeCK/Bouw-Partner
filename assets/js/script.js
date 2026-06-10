const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#site-nav");
const navLinks = nav ? Array.from(nav.querySelectorAll("a")) : [];
const revealItems = Array.from(document.querySelectorAll(".is-reveal"));
const yearNodes = Array.from(document.querySelectorAll("[data-year]"));
const images = Array.from(document.images);
const carousels = Array.from(document.querySelectorAll("[data-carousel]"));

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

function initCarousels() {
  carousels.forEach((carousel) => {
    const shell = carousel.closest(".project-gallery-shell");
    const prevButton = shell ? shell.querySelector("[data-carousel-prev]") : null;
    const nextButton = shell ? shell.querySelector("[data-carousel-next]") : null;
    const dotsNode = shell ? shell.querySelector("[data-carousel-dots]") : null;
    const slides = Array.from(carousel.querySelectorAll(".project-card"));

    if (!shell || !prevButton || !nextButton || !dotsNode || slides.length < 2) {
      return;
    }

    dotsNode.innerHTML = "";

    const dots = slides.map((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel-dot";
      dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
      dot.addEventListener("click", () => {
        slides[index].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "start"
        });
      });
      dotsNode.appendChild(dot);
      return dot;
    });

    function getActiveIndex() {
      const viewportCenter = carousel.scrollLeft + carousel.clientWidth / 2;
      let activeIndex = 0;
      let smallestDistance = Number.POSITIVE_INFINITY;

      slides.forEach((slide, index) => {
        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
        const distance = Math.abs(slideCenter - viewportCenter);

        if (distance < smallestDistance) {
          smallestDistance = distance;
          activeIndex = index;
        }
      });

      return activeIndex;
    }

    function updateCarouselUI() {
      const activeIndex = getActiveIndex();

      dots.forEach((dot, index) => {
        dot.classList.toggle("is-active", index === activeIndex);
      });

      prevButton.disabled = activeIndex === 0;
      nextButton.disabled = activeIndex === slides.length - 1;
    }

    prevButton.addEventListener("click", () => {
      const activeIndex = getActiveIndex();
      const targetIndex = Math.max(0, activeIndex - 1);
      slides[targetIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start"
      });
    });

    nextButton.addEventListener("click", () => {
      const activeIndex = getActiveIndex();
      const targetIndex = Math.min(slides.length - 1, activeIndex + 1);
      slides[targetIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start"
      });
    });

    let ticking = false;

    carousel.addEventListener("scroll", () => {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(() => {
        updateCarouselUI();
        ticking = false;
      });
    }, { passive: true });

    window.addEventListener("resize", updateCarouselUI);
    updateCarouselUI();
  });
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
initCarousels();

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
