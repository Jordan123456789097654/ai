// Background Service Worker for Kyro AI Extension
const KYRO_API_URL = "https://kyro-api-auou.onrender.com/v1/chat/completions";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "improve_text") {
    (async () => {
      try {
        const { apiKey } = await chrome.storage.local.get("apiKey");
        const promptInstruction = getInstructionForMode(request.mode, request.text);

        const res = await fetch(KYRO_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
          },
          body: JSON.stringify({
            model: "kyro-coder-pro",
            messages: [
              {
                role: "system",
                content: "You are Kyro AI Writing & Coding Assistant. Output ONLY the improved text or code replacement. Do not include markdown code block backticks unless returning code.",
              },
              { role: "user", content: promptInstruction },
            ],
            temperature: 0.3,
            stream: false,
          }),
        });

        if (!res.ok) {
          throw new Error(`API Error ${res.status}`);
        }

        const data = await res.json();
        const result = data.choices?.[0]?.message?.content || request.text;
        sendResponse({ success: true, text: result });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true; // Keep message channel open for async response
  }
});

function getInstructionForMode(mode, text) {
  switch (mode) {
    case "fix_grammar":
      return `Fix all grammar, spelling, and punctuation errors in the following text. Preserve tone:\n\n${text}`;
    case "improve":
      return `Rewrite the following text to sound professional, fluent, and compelling:\n\n${text}`;
    case "refactor_code":
      return `Refactor and clean up the following code snippet. Fix bugs and add TypeScript types if applicable:\n\n${text}`;
    case "summarize":
      return `Summarize the following text into concise bullet points:\n\n${text}`;
    default:
      return `Improve the following text:\n\n${text}`;
  }
}
