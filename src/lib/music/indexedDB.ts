const DB_NAME = "BarberOSMusicDB";
const STORE_NAME = "local_tracks";
const DB_VERSION = 1;

export interface StoredTrack {
  id: string;
  name: string;
  type: string;
  blob: Blob;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject("IndexedDB no está soportado en este entorno");
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveLocalTracksToDB(files: File[]): Promise<StoredTrack[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  const storedTracks: StoredTrack[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const trackItem: StoredTrack = {
      id: `saved-track-${Date.now()}-${i}-${file.name}`,
      name: file.name,
      type: file.type,
      blob: file,
    };
    store.put(trackItem);
    storedTracks.push(trackItem);
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(storedTracks);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getLocalTracksFromDB(): Promise<StoredTrack[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("Error al obtener tracks de IndexedDB:", err);
    return [];
  }
}

export async function clearLocalTracksFromDB(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.clear();

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
