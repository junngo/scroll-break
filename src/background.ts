/**
 * Service worker: handles storage and optional messaging.
 * Most logic lives in the content script so it can access the page.
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log("Scroll Break extension installed.");
});
