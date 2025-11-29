/**
 * Ka ⇄ Eng Keyboard Converter
 * Automatically converts text between Georgian and English keyboard layouts
 */

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const CONFIG = {
  // Visitor Counter API (CORS-enabled)
  VISITOR_API_BASE: "https://visitor.6developer.com",

  THEME_STORAGE_KEY: "theme",
  GEORGIAN_UNICODE_RANGE: /[\u10A0-\u10FF]/,
};

// English to Georgian keyboard mapping
const EN_TO_KA_MAP = {
  // Lowercase letters
  q: "ქ",
  w: "წ",
  e: "ე",
  r: "რ",
  t: "ტ",
  y: "ყ",
  u: "უ",
  i: "ი",
  o: "ო",
  p: "პ",
  a: "ა",
  s: "ს",
  d: "დ",
  f: "ფ",
  g: "გ",
  h: "ჰ",
  j: "ჯ",
  k: "კ",
  l: "ლ",
  z: "ზ",
  x: "ხ",
  c: "ც",
  v: "ვ",
  b: "ბ",
  n: "ნ",
  m: "მ",

  // Special uppercase letters
  S: "შ",
  T: "თ",
  R: "ღ",
  W: "ჭ",
  C: "ჩ",
  Z: "ძ",
};

// Create reverse mapping: Georgian to English
const KA_TO_EN_MAP = Object.fromEntries(
  Object.entries(EN_TO_KA_MAP).map(([en, ka]) => [ka, en])
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if text contains Georgian characters
 */
function containsGeorgian(text) {
  return CONFIG.GEORGIAN_UNICODE_RANGE.test(text);
}

/**
 * Convert text between Georgian and English keyboard layouts
 * Automatically detects the source language
 */
function convertText(text) {
  if (!text) return "";

  const isGeorgian = containsGeorgian(text);
  const sourceMap = isGeorgian ? KA_TO_EN_MAP : EN_TO_KA_MAP;

  return Array.from(text)
    .map((char) => {
      // Try exact match first (preserves case)
      if (sourceMap[char]) return sourceMap[char];

      // For English to Georgian: try lowercase if uppercase not found
      if (!isGeorgian) {
        const lowerChar = char.toLowerCase();
        if (sourceMap[lowerChar]) return sourceMap[lowerChar];
      }

      // Return original character if no mapping exists
      return char;
    })
    .join("");
}

/**
 * Copy text to clipboard with fallback for older browsers
 */
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      return success;
    }
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * Read text from clipboard
 */
async function readFromClipboard() {
  try {
    if (navigator.clipboard?.readText) {
      return await navigator.clipboard.readText();
    }
    return null;
  } catch (error) {
    console.error("Failed to read from clipboard:", error);
    return null;
  }
}

// ============================================================================
// TEXT CONVERTER MODULE
// ============================================================================

class TextConverter {
  constructor() {
    this.inputEl = document.getElementById("inputText");
    this.outputEl = document.getElementById("outputText");
    this.pasteBtn = document.getElementById("pasteBtn");
    this.clearBtn = document.getElementById("clearBtn");

    this.init();
  }

  init() {
    // Event listeners
    this.inputEl.addEventListener("input", () => this.handleConversion());
    this.pasteBtn.addEventListener("click", () => this.handlePaste());
    this.clearBtn.addEventListener("click", () => this.handleClear());

    // Initial conversion
    this.handleConversion();
  }

  async handleConversion() {
    const inputText = this.inputEl.value;
    const outputText = convertText(inputText);

    this.outputEl.value = outputText;

    // Auto-copy to clipboard if there's output
    if (outputText) {
      await copyToClipboard(outputText);
    }
  }

  async handlePaste() {
    const text = await readFromClipboard();
    if (text !== null) {
      this.inputEl.value = text;
      await this.handleConversion();
    }
  }

  handleClear() {
    this.inputEl.value = "";
    this.outputEl.value = "";
    this.inputEl.focus();
  }
}

// ============================================================================
// THEME MANAGER
// ============================================================================

class ThemeManager {
  constructor() {
    this.toggleBtn = document.getElementById("themeToggle");
    this.init();
  }

  init() {
    // Load saved theme
    const savedTheme = localStorage.getItem(CONFIG.THEME_STORAGE_KEY);
    if (savedTheme === "dark") {
      this.setDarkMode(true);
    }

    // Toggle on click
    this.toggleBtn.addEventListener("click", () => this.toggle());
  }

  toggle() {
    const isDark = document.body.classList.toggle("dark");
    this.setDarkMode(isDark);
  }

  setDarkMode(isDark) {
    if (isDark) {
      document.body.classList.add("dark");
      this.toggleBtn.textContent = "☀️";
      localStorage.setItem(CONFIG.THEME_STORAGE_KEY, "dark");
    } else {
      document.body.classList.remove("dark");
      this.toggleBtn.textContent = "🌙";
      localStorage.setItem(CONFIG.THEME_STORAGE_KEY, "light");
    }
  }
}

// ============================================================================
// VISITOR COUNTER (Today + Total via Visitor Counter API)
// ============================================================================

async function updateVisitorCount() {
  const counterEl = document.getElementById("visitCount");
  if (!counterEl) return;

  counterEl.textContent = "...";

  const payload = {
    domain: window.location.hostname, // "lupusa87.github.io" in prod, "localhost" in dev
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    page_path: window.location.pathname,
    page_title: document.title,
    referrer: document.referrer || "",
  };

  try {
    const res = await fetch(`${CONFIG.VISITOR_API_BASE}/visit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Visitor API error: " + res.status);
    }

    const data = await res.json();

    const total =
      typeof data.totalCount === "number" ? data.totalCount : 0;
    const today =
      typeof data.todayCount === "number" ? data.todayCount : 0;

    counterEl.textContent = `${today}/${total}`;
  } catch (err) {
    console.error("Failed to update visitor count:", err);
    counterEl.textContent = "შეცდომა";
  }
}

// ============================================================================
// SHARE FUNCTIONALITY
// ============================================================================

function initializeShareButtons() {
  const pageUrl = encodeURIComponent(window.location.href);
  const pageTitle = encodeURIComponent(
    "Ka ⇄ Eng კლავიატურის ავტომატური კონვერტორი"
  );

  const shareUrls = {
    fb: `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`,
    x: `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${pageUrl}&title=${pageTitle}`,
    whatsapp: `https://wa.me/?text=${pageTitle}%20${pageUrl}`,
    telegram: `https://t.me/share/url?url=${pageUrl}&text=${pageTitle}`,
  };

  // Set href for each share button
  Object.entries(shareUrls).forEach(([platform, url]) => {
    const button = document.querySelector(`.share-button.${platform}`);
    if (button) button.href = url;
  });

  // Copy link button
  const copyLinkBtn = document.querySelector(".share-button.copylink");
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const success = await copyToClipboard(window.location.href);
      if (!success) {
        alert("ვერ მოხერხდა ბმულის კოპირება");
      }
    });
  }
}

// ============================================================================
// FOOTER YEAR
// ============================================================================

function updateFooterYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  // Initialize all modules
  new TextConverter();
  new ThemeManager();
  updateVisitorCount();
  initializeShareButtons();
  updateFooterYear();
});
