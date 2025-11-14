const enToKaMap = {
  // ქვედა რეგისტრი
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

  // ზემოთრეგისტრის სპეციალური ღილაკები
  S: "შ",
  T: "თ",
  R: "ღ",
  W: "ჭ",
  C: "ჩ",
  Z: "ძ",
};

// Inverse map: KA → EN
const kaToEnMap = {};
for (const [en, ka] of Object.entries(enToKaMap)) {
  kaToEnMap[ka] = en;
}

function containsGeorgian(text) {
  return /[\u10A0-\u10FF]/.test(text);
}

function convertText(text) {
  const isGeorgian = containsGeorgian(text);

  const output = Array.from(text)
    .map((ch) => {
      if (isGeorgian) {
        // KA → EN
        return kaToEnMap[ch] ?? ch;
      } else {
        // EN → KA
        // ჯერ ვცდილობთ ზუსტ დამთხვევას (რეგისტრის ჩათვლით)
        const exact = enToKaMap[ch];
        if (exact) return exact;

        // თუ ზუსტი არ არსებობს, ვარდებით ქვედა რეგისტრზე
        const lower = ch.toLowerCase();
        const lowerMapped = enToKaMap[lower];
        return lowerMapped ?? ch;
      }
    })
    .join("");

  return output;
}

const inputEl = document.getElementById("inputText");
const outputEl = document.getElementById("outputText");
const pasteBtn = document.getElementById("pasteBtn");

async function runConversion() {
  const text = inputEl.value || "";
  const output = convertText(text);

  outputEl.value = output;

  if (!output) return;

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(output);
    } else {
      outputEl.select();
      document.execCommand("copy");
    }
  } catch (e) {
    // ჩუმი შეცდომა — ვიზუალურად არაფერს ვაჩვენებთ
  }
}

// ჩასმა კლიპბორდიდან
pasteBtn.addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();
    inputEl.value = text;
    await runConversion();
  } catch (e) {
    // ჩუმი შეცდომა — სტატიკური ტექსტს არ ვცვლით
  }
});

// ავტომატური კონვერტაცია ტაიპინგისას
inputEl.addEventListener("input", () => {
  runConversion();
});

// საწყისი გაშვება
runConversion();

/* 🌗 Dark / Light Theme Toggle */
const themeToggle = document.getElementById("themeToggle");

// Load saved theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️";
}

// Toggle on click
themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");

  if (isDark) {
    themeToggle.textContent = "☀️";
    localStorage.setItem("theme", "dark");
  } else {
    themeToggle.textContent = "🌙";
    localStorage.setItem("theme", "light");
  }
});


async function updateVisitorCount() {
  const el = document.getElementById("visitCount");
  if (!el) return;

  try {
    const res = await fetch(
      "https://counterapi.com/api/lupusa87vakhtangiabashidze-ka-eng/view/ka-eng-converter"
    );
    const data = await res.json();
    el.textContent = data.value;
  } catch (err) {
    console.error("Counter error:", err);
    el.textContent = "შეცდომა";
  }
}

// run after page loads
document.addEventListener("DOMContentLoaded", updateVisitorCount);


const year = new Date().getFullYear();
document.getElementById("year").textContent = year;

/* SHARE BUTTONS */
const pageUrl = encodeURIComponent(window.location.href);
const pageTitle = encodeURIComponent(
  "Ka ⇄ Eng კლავიატურის ავტომატური კონვერტორი"
);

document.querySelector(
  ".share-button.fb"
).href = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;

document.querySelector(
  ".share-button.x"
).href = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;

document.querySelector(
  ".share-button.linkedin"
).href = `https://www.linkedin.com/shareArticle?mini=true&url=${pageUrl}&title=${pageTitle}`;

document.querySelector(
  ".share-button.whatsapp"
).href = `https://wa.me/?text=${pageTitle}%20${pageUrl}`;

document.querySelector(
  ".share-button.telegram"
).href = `https://t.me/share/url?url=${pageUrl}&text=${pageTitle}`;

document
  .querySelector(".share-button.copylink")
  .addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      //alert("ბმული დაკოპირდა!");
    } catch {
      alert("ვერ მოხერხდა ბმულის კოპირება");
    }
  });
