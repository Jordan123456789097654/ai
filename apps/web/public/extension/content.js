// Grammarly-Style Floating AI Assistant Content Script
let activeInput = null;
let widgetEl = null;

document.addEventListener("focusin", (e) => {
  const target = e.target;
  if (target && (target.tagName === "TEXTAREA" || (target.tagName === "INPUT" && target.type === "text") || target.isContentEditable)) {
    activeInput = target;
    showKyroWidget(target);
  }
});

function showKyroWidget(inputEl) {
  removeKyroWidget();

  widgetEl = document.createElement("div");
  widgetEl.className = "kyro-ai-widget";
  widgetEl.innerHTML = `
    <button class="kyro-btn-main" title="Kyro AI Assistant">⚡ Kyro</button>
    <div class="kyro-menu shadow-lg">
      <button data-mode="fix_grammar">✨ Fix Grammar & Typos</button>
      <button data-mode="improve">🚀 Professional Rewrite</button>
      <button data-mode="refactor_code">💻 Refactor Code</button>
      <button data-mode="summarize">📝 Summarize Text</button>
    </div>
  `;

  document.body.appendChild(widgetEl);

  positionWidget(inputEl);

  const mainBtn = widgetEl.querySelector(".kyro-btn-main");
  const menu = widgetEl.querySelector(".kyro-menu");

  mainBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("active");
  });

  menu.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const mode = btn.getAttribute("data-mode");
      processInputText(inputEl, mode, btn);
    });
  });
}

function positionWidget(inputEl) {
  if (!widgetEl || !inputEl) return;
  const rect = inputEl.getBoundingClientRect();
  widgetEl.style.top = `${window.scrollY + rect.bottom - 36}px`;
  widgetEl.style.left = `${window.scrollX + rect.right - 80}px`;
}

async function processInputText(inputEl, mode, btnEl) {
  const originalText = inputEl.value || inputEl.innerText || "";
  if (!originalText.trim()) return;

  const originalBtnText = btnEl.innerText;
  btnEl.innerText = "⏳ Processing...";

  chrome.runtime.sendMessage(
    { action: "improve_text", mode, text: originalText },
    (response) => {
      btnEl.innerText = originalBtnText;
      if (response && response.success && response.text) {
        if (inputEl.value !== undefined) {
          inputEl.value = response.text;
        } else {
          inputEl.innerText = response.text;
        }
        if (widgetEl) {
          const menu = widgetEl.querySelector(".kyro-menu");
          if (menu) menu.classList.remove("active");
        }
      } else {
        alert(`Kyro AI Error: ${response?.error || "Unable to complete request"}`);
      }
    }
  );
}

function removeKyroWidget() {
  if (widgetEl) {
    widgetEl.remove();
    widgetEl = null;
  }
}

document.addEventListener("click", (e) => {
  if (widgetEl && !widgetEl.contains(e.target)) {
    const menu = widgetEl.querySelector(".kyro-menu");
    if (menu) menu.classList.remove("active");
  }
});
