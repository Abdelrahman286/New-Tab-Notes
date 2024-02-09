chrome.tabs.onUpdated.addListener(async (tabID, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    if (tab.url === "chrome://newtab/") {
      // check the flag of disabled/enabled in storage
      // I CAN NOT INJECT ANY SCRIPT ON ANY PAGE STARTING WITH CHROME://
      const flag = await chrome.storage.sync.get(["overrideNewTab"]);

      if (flag.overrideNewTab == true) {
        // get the id of the extension 
        const newURL =
          "chrome-extension://adgfaaichdfpmmadljcbeiodfbdbhldg/page.html";
        chrome.tabs.update(tab.id, { url: newURL });
      }
    }
  }
});

chrome.runtime.onInstalled.addListener(() => {
  // Set initial override value
  chrome.storage.sync.set({ overrideNewTab: true });
});
