// Background service worker with IndexedDB storage
console.log('[Legal Lens] background service worker starting');

// Open or create the IndexedDB database
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('WebCollectorDB', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pages')) {
        db.createObjectStore('pages', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

// Save a page record
async function savePageData(data) {
  try {
    const db = await openDatabase();
    const tx = db.transaction('pages', 'readwrite');
    const store = tx.objectStore('pages');
    store.add(data);
    tx.oncomplete = () => console.log('[Legal Lens] ✅ Data saved:', data);
    tx.onerror = (err) => console.error('[Legal Lens] ❌ Save failed:', err);
  } catch (err) {
    console.error('[Legal Lens] ❌ IndexedDB error:', err);
  }
}

// Read all page records
async function getAllPages() {
  const db = await openDatabase();
  const tx = db.transaction('pages', 'readonly');
  const store = tx.objectStore('pages');
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

// Message router
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.type) return;

  if (message.type === 'SAVE_DATA') {
    savePageData(message.payload);
    return true;
  }

  if (message.type === 'GET_ALL_PAGES') {
    getAllPages().then((pages) => sendResponse({ pages })).catch((e) => {
      console.error('[Legal Lens] getAllPages error', e);
      sendResponse({ pages: [], error: String(e) });
    });
    return true; // async response
  }
});


