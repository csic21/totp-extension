// Background script for the extension
// This script runs in the background and can handle events, manage storage, etc.

// Create a context menu item for opening the side panel
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus?.create({
    id: "openSidePanel",
    title: "Open TOTP Authenticator Side Panel",
    contexts: ["action"], // Right-click on the extension icon
  });
});

// Handle context menu clicks
chrome.contextMenus?.onClicked?.addListener((info, _tab) => {
  if (info.menuItemId === "openSidePanel") {
    // Open the side panel
    chrome.windows.getCurrent().then((window) => {
      if (window.id) {
        chrome.sidePanel.open({ windowId: window.id });
      }
    });
  }
});
