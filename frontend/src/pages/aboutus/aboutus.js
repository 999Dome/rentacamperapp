const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));


const inner = document.querySelector(".hero-inner");
if (inner) {
  document.querySelector(".hero")?.addEventListener("mousemove", (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
    const dy = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
    inner.style.transform = `translate(${dx * 6}px, ${dy * 6}px)`;
  });
  document.querySelector(".hero")?.addEventListener("mouseleave", () => {
    inner.style.transform = "";
  });
}
