const activateButton = document.querySelector(".activate");
const openInNewTab = document.querySelector(".openInNewTab");
const exportNotes = document.querySelector(".exportNotes");
const box = document.querySelector(".box");
const extStatus = document.querySelector(".status");

// INTIAL STATUS
async function init() {
  const intialFlag = await chrome.storage.sync.get(["overrideNewTab"]);
  extStatus.textContent = `THE EXTENSION IS ${intialFlag.overrideNewTab}`;
}
init();

// OPEN IN NEW TAB
openInNewTab.addEventListener("click", () => {
  chrome.tabs.create({
    url: "page.html",
  });
});

// ENABLE/DISABLE
activateButton.addEventListener("click", async () => {
  const flag = await chrome.storage.sync.get(["overrideNewTab"]);
  console.log(flag.overrideNewTab);
  if (flag.overrideNewTab == true) {
    chrome.storage.sync.set({ overrideNewTab: false });

    extStatus.textContent = "it's paused";
  } else {
    chrome.storage.sync.set({ overrideNewTab: true });
    extStatus.textContent = "it's working";
  }
});

// EXPORT ALL NOTES
exportNotes.addEventListener("click", async () => {
  const notes = await chrome.storage.local.get(null);

  console.log(notes);
  downloadObjectAsJson(notes, "notes.json");
});

function downloadObjectAsJson(object, fileName) {
  const jsonString = JSON.stringify(object);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
