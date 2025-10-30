// Collect basic page data and send to background for storage
const pageData = {
  title: document.title,
  url: location.href,
  timestamp: Date.now()
};

try {
  chrome.runtime.sendMessage({ type: 'SAVE_DATA', payload: pageData });
} catch (e) {
  // In case messaging is unavailable in some contexts
  console.warn('[Legal Lens] Unable to send page data:', e);
}


