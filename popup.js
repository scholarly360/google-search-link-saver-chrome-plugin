document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('startSession');
  const stopButton = document.getElementById('stopSession');

  startButton.addEventListener('click', () => {
    chrome.storage.local.set({ sessionActive: true, savedLinks: [] }, () => {
      console.log('Session started');
      // Tell the content script to start extracting links
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'startSession' });
      });
    });
  });

  stopButton.addEventListener('click', () => {
    chrome.storage.local.set({ sessionActive: false }, () => {
      console.log('Session stopped');
    });
  });
});
