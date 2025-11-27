document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("share-container");
  if (!container) return;

  fetch("sharebuttons/share.html")
    .then((r) => r.text())
    .then((html) => {
      container.innerHTML = html;
      attachShareHandlers(container);
    })
    .catch((err) => {
      console.error("Failed to load share buttons:", err);
    });
});

function attachShareHandlers(container) {
  const buttons = container.querySelectorAll(".share-button");
  const pageUrl = () => location.href;
  const outputText = () => document.getElementById("outputText")?.value || document.title;

  buttons.forEach((btn) => {
    const type = btn.dataset.share;
    if (!type) return;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const url = buildShareUrl(type, outputText(), pageUrl());

      if (type === "copy") {
        copyToClipboard(pageUrl(), btn);
        return;
      }

      if (url) {
        window.open(url, "_blank", "noopener,noreferrer,width=600,height=450");
      }
    });
  });
}

function buildShareUrl(type, text, url) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  switch (type) {
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    case "x":
      return `https://twitter.com/intent/tweet?text=${t}&url=${u}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    case "whatsapp":
      return `https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`;
    case "telegram":
      return `https://t.me/share/url?url=${u}&text=${t}`;
    default:
      return null;
  }
}

function copyToClipboard(text, btn) {
  if (!navigator.clipboard) {
    // Fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      showCopyFeedback(btn);
    } catch (err) {
      alert("Copy failed");
    }
    ta.remove();
    return;
  }

  navigator.clipboard
    .writeText(text)
    .then(() => showCopyFeedback(btn))
    .catch((err) => {
      console.error("Copy failed", err);
    });
}

function showCopyFeedback(btn) {
  const orig = btn.innerHTML;
  btn.textContent = "დაკოპირდა";
  setTimeout(() => {
    btn.innerHTML = orig;
  }, 1500);
}
