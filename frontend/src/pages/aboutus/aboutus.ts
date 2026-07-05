import "bootstrap/dist/css/bootstrap.min.css";
import "../../scss/theme.scss";
import { MainHeader } from "../../components/mainheader.tsx";
import { MainFooter } from "../../components/mainfooter.tsx";
import { AboutUsPage } from "../../components/aboutus/AboutUsPage.tsx";

import { getAllLocations } from "../../api/locationsAPI.ts";

/**
 * Bootstrap entry point for the "Über uns" MPA page: mounts the header,
 * the about-us content (with the locations list, falling back to an empty
 * list if it fails to load), and the footer, then wires up the page's
 * scroll/parallax animations once everything is in the DOM.
 */
async function renderAboutUs() {
  document.body.appendChild(MainHeader());
  
  try {
    const locations = await getAllLocations();
    document.body.appendChild(AboutUsPage(locations));
  } catch (error) {
    console.error("Failed to load locations", error);
    document.body.appendChild(AboutUsPage([]));
  }

  document.body.appendChild(MainFooter());
  
  // Call animations setup after everything is in the DOM
  setupAnimations();
}

/**
 * Wires up two purely visual, DOM-API-driven effects that can't be expressed
 * as static JSX because they react to live browser events:
 * - a scroll-triggered fade-in for every `.reveal` element, using an
 *   `IntersectionObserver` (each element is animated in once, then
 *   unobserved so it doesn't re-trigger)
 * - a subtle parallax effect on the hero banner: as the mouse moves over
 *   `.hero`, `.hero-inner` is nudged a few pixels in the direction of the
 *   cursor, and reset when the mouse leaves.
 */
const setupAnimations = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  const hero = document.querySelector(".hero") as HTMLElement;
  const inner = document.querySelector(".hero-inner") as HTMLElement;
  if (hero && inner) {
    hero.addEventListener("mousemove", (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
      const dy = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
      inner.style.transform = `translate(${dx * 6}px, ${dy * 6}px)`;
    });
    hero.addEventListener("mouseleave", () => {
      inner.style.transform = "";
    });
  }
};

renderAboutUs();
