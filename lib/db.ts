let request: IDBOpenDBRequest;
let db: IDBDatabase;
let version = 1;

export interface User {
  id: string;
  name: string;
  email: string;
}

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve) => {
    request = indexedDB.open('myDB');

    // if the data object store doesn't exist, create it
    request.onupgradeneeded = () => {
      db = request.result;

      if (!db.objectStoreNames.contains('users')) {
        console.log('Creating users store');
        db.createObjectStore('users', { keyPath: 'id' });
      }
      // no need to resolve here
    };

    request.onsuccess = () => {
      db = request.result;
      version = db.version;
      console.log('request.onsuccess - initDB', version);
      resolve(true);
    };

    request.onerror = () => {
      resolve(false);
    };
  });
};

export {};
