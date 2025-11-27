document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("profile-container");
  if (!container) return;

  fetch("profile/profile.html")
    .then((r) => r.text())
    .then((html) => {
      container.innerHTML = html;
    })
    .catch((err) => {
      console.error("Failed to load profile component:", err);
    });
});
