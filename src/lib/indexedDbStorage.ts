/**
 * IndexedDB storage for large files (PDF, Word, PPTX)
 * Avoids browser localStorage 5MB quota limit
 */

const DB_NAME = 'portfolio_files_db';
const STORE_NAME = 'task_files';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not supported in this browser'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface StoredFileData {
  id: string;
  fileName: string;
  fileData: string; // Base64 dataURL
  mimeType: string;
  fileSize?: string;
  updatedAt: number;
}

export async function saveFileToIndexedDB(file: StoredFileData): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(file);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn('IndexedDB save error:', err);
    return false;
  }
}

export async function getFileFromIndexedDB(id: string): Promise<StoredFileData | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('IndexedDB get error:', err);
    return null;
  }
}

export async function deleteFileFromIndexedDB(id: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn('IndexedDB delete error:', err);
    return false;
  }
}
