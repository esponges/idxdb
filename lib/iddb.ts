// polyfill for indexedDB

export enum DBName {
  Main = "main",
}

export enum StoreName {
  Users = "users",
  Posts = "posts",
}

// type UpgradeneededEvent = IDBVersionChangeEvent & {
//   target: IDBOpenDBRequest;
// }

let request: IDBOpenDBRequest;

if (typeof window !== 'undefined' && window.indexedDB) {
  request = window.indexedDB.open(DBName.Main, 1);
} else {
  console.error("Your browser doesn't support a stable version of IndexedDB.");
}

// we will use this function to create a new indexedDB
export const createDB = (storeName: StoreName) => {
  request.onupgradeneeded = (_event) => {
    const db = request.result;
    db.createObjectStore(storeName, { keyPath: "id" });
  };
}

// we will use this function to add data to our indexedDB
export const addData = <T>(storeName: StoreName, data: T) => {
  request.onsuccess = (_event) => {
    const db = request.result;
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    store.add(data);
  };
}

// we will use this function to get data from our indexedDB
export const getData = <T>(storeName: StoreName, id: string): Promise<T | undefined> => {
  return new Promise((resolve) => {
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const dataRequest = store.get(id);
      dataRequest.onsuccess = () => {
        resolve(dataRequest.result);
      };
    };
  });
}

// we will use this function to delete data from our indexedDB
export const deleteData = (storeName: StoreName, id: string) => {
  request.onsuccess = (_event) => {
    const db = request.result;
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    store.delete(id);
  };
}

// we will use this function to clear all data from our indexedDB
export const clearData = (storeName: StoreName) => {
  request.onsuccess = (_event) => {
    const db = request.result;
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    store.clear();
  };
}

// we will use this function to get all data from our indexedDB
export const getAllData = (storeName: StoreName) => {
  request.onsuccess = (_event) => {
    const db = request.result;
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const data = store.getAll();
    return data;
  };
}

// remove isolatedModules from tsconfig.json warning
export {}
