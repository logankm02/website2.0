// Smooth-scrolls to a section, offset so content isn't flush with the viewport top.
export function scrollToSection(id, offset = -80) {
  const element = document.getElementById(id);
  if (!element) return;
  const y = element.getBoundingClientRect().top + window.pageYOffset + offset;
  window.scrollTo({ top: y, behavior: "smooth" });
}
