chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.url) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['button_loader.js'],
    });
  }
});
