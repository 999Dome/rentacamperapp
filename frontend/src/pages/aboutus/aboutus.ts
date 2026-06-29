import "bootstrap/dist/css/bootstrap.min.css";
import "../../scss/theme.scss";
import "./aboutus.css";
import { MainHeader } from "../../components/mainheader.tsx";
import { MainFooter } from "../../components/mainfooter.tsx";
import { AboutUsPage } from "../../components/aboutus/AboutUsPage.tsx";

document.body.appendChild(MainHeader());
document.body.appendChild(AboutUsPage());
document.body.appendChild(MainFooter());

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

setTimeout(setupAnimations, 50);
