document.addEventListener("DOMContentLoaded", async () => {
  const apiKeyInput = document.getElementById("apiKey");
  const saveBtn = document.getElementById("saveBtn");
  const statusMsg = document.getElementById("statusMsg");

  const { apiKey } = await chrome.storage.local.get("apiKey");
  if (apiKey) apiKeyInput.value = apiKey;

  saveBtn.addEventListener("click", async () => {
    const key = apiKeyInput.value.trim();
    await chrome.storage.local.set({ apiKey: key });
    statusMsg.innerText = "Settings Saved Successfully ✓";
    setTimeout(() => {
      statusMsg.innerText = "Connected to Kyro Gateway";
    }, 2000);
  });
});
