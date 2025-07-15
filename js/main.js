let emergencies = [];

const container = document.getElementById("emergencyGrid");
const guideTitle = document.getElementById("guideTitle");
const guideContent = document.getElementById("guideContent");
const languageSelect = document.getElementById("languageSelect");
const darkSwitch = document.getElementById("darkSwitch");

// Load emergency data based on language
async function loadLanguage(lang) {
  try {
    const res = await fetch(`js/lang/${lang}.json`);
    emergencies = await res.json();
    renderCards();
  } catch (error) {
    console.error("Error loading language:", error);
  }
}

// Render emergency cards
function renderCards() {
  container.innerHTML = "";
  emergencies.forEach((item, index) => {
    const col = document.createElement("div");
    col.className = "col-12 col-md-4 mb-4";
    col.innerHTML = `
      <div class="card h-100 shadow" onclick="showGuide(${index})">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
          <p class="card-text">${item.desc}</p>
        </div>
      </div>`;
    container.appendChild(col);
  });
}

// Show emergency guide in modal
function showGuide(index) {
  const data = emergencies[index];
  guideTitle.textContent = `${data.title} Guide`;
  guideContent.innerHTML = data.steps
    .map((step, i) => `<p><strong>Step ${i + 1}:</strong> ${step}</p>`)
    .join("");

  const modal = new bootstrap.Modal(document.getElementById("guideModal"));
  modal.show();

  // Speak out loud with voice delay handling
  const text = data.steps.join(". ");
  const langCode = languageSelect.value === "te" ? "te-IN" : "en-US";

  function speak() {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  }

  if (speechSynthesis.getVoices().length === 0) {
    speechSynthesis.onvoiceschanged = () => speak();
  } else {
    speak();
  }
}

// Handle language change
languageSelect.addEventListener("change", (e) => {
  loadLanguage(e.target.value);
  speechSynthesis.cancel(); // Stop any running speech
});

// Handle dark mode toggle
darkSwitch.addEventListener("change", () => {
  const isDark = darkSwitch.checked;
  document.body.classList.toggle("dark-mode", isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// Initialize app
window.addEventListener("DOMContentLoaded", () => {
  // Restore theme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    darkSwitch.checked = true;
  }

  // Load default language
  loadLanguage(languageSelect.value || "en");
});

function stopVoice() {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
}

document.getElementById("guideModal").addEventListener("hidden.bs.modal", () => {
  speechSynthesis.cancel();
});
