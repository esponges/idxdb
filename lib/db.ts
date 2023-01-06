let request: IDBOpenDBRequest;
let db: IDBDatabase;
let version = 1;

export interface User {
  id: string;
  name: string;
  email: string;
}

export const Stores = {
  Users: 'users',
};

export const initDB = (): Promise<boolean|IDBDatabase> => {
  return new Promise((resolve) => {
    request = indexedDB.open('myDB');

    // if the data object store doesn't exist, create it
    request.onupgradeneeded = () => {
      db = request.result;

      if (!db.objectStoreNames.contains(Stores.Users)) {
        console.log('Creating users store');
        db.createObjectStore(Stores.Users, { keyPath: 'id' });
      }
      // no need to resolve here
    };

    request.onsuccess = (e) => {
      db = request.result;
      // get current version and store it
      version = db.version;
      resolve(request.result);
    };

    request.onerror = (e) => {
      resolve(false);
    };
  });
};

export const addData = <T>(storeName: string, data: T): Promise<T|string|null> => {
  return new Promise((resolve) => {
    request = indexedDB.open('myDB', version);

    request.onsuccess = () => {
      console.log('request.onsuccess - addData', data);
      db = request.result;
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.add(data);
      resolve(data);
    };

    request.onerror = () => {
      const error = request.error?.message
      if (error) {
        resolve(error);
      } else {
        resolve('Unknown error');
      }
    };
  });
};

export {};
