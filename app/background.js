chrome.runtime.setUninstallURL(
  "https://forms.gle/psv5crzgi53Ydkic8",
  function () {
    if (chrome.runtime.lastError) {
      console.error("Error setting uninstall URL:", chrome.runtime.lastError);
    } else {
      console.log("Uninstall URL set successfully.");
    }
  }
);
