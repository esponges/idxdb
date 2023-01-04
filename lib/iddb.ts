export enum DBName {
  Main = 'main',
}

export enum StoreName {
  Users = 'users',
  Posts = 'posts',
  News = 'news',
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Post {
  id: string;
  title: string;
  body: string;
}

let request: IDBOpenDBRequest;
let db: IDBDatabase;
let version = 1;

// if (typeof window !== 'undefined' && 'indexedDB' in window) {
//   console.log('This browser supports IndexedDB');
//   request = window.indexedDB.open(DBName.Main, version); // open a new connection to the database
//   request.onsuccess = (_event) => {
//     db = request.result;
//     console.log('Database initialized successfully');
//   };
// }

export const initDb = () => {
  if (typeof window === 'undefined') return;
  // open current connection with the existing version — no second argument is passed
  request = window.indexedDB.open(DBName.Main);

  request.onsuccess = (_event) => {
    db = request.result;
    // update global version for the next requests
    version = db.version;
    console.log('Database initialized successfully');
  };

  request.onerror = (event) => {
    console.error('Error initializing database', event);
  }

  // close the database connection when the window is closed
  window.onunload = () => {
    db.close();
  }
};

// we will use this function to create a new store in our indexedDB
export const createDB = () => {
  version += 1;
  request = window.indexedDB.open(DBName.Main, version); // open a new connection to the database
  /* 
  onupgradeneeded is called when the database is created or the version is changed
  the version should only change when we add, remove or modify a store
  */
  request.onupgradeneeded = (_event) => {
    db = request.result;
    if (!db.objectStoreNames.contains(StoreName.Users)) {
      console.log(`Creating ${StoreName.Users} store`);
      db.createObjectStore(StoreName.Users, { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains(StoreName.Posts)) {
      console.log(`Creating ${StoreName.Posts} store`);
      db.createObjectStore(StoreName.Posts, { keyPath: 'id' });
    }
  };
};

export const createStore = (storeName: StoreName) => {
  version += 1;
  request = window.indexedDB.open(DBName.Main, version); // open a new connection to the database

  request.onupgradeneeded = (_event) => {
    db = request.result;
    if (!db.objectStoreNames.contains(storeName)) {
      console.log(`Creating ${storeName} store`);
      db.createObjectStore(storeName, { keyPath: 'id' });
    }
  };

  request.onsuccess = (_event) => {
    console.log(`Store ${storeName} created successfully`);
    // close the database connection
    db.close();
  };

  request.onerror = (event) => {
    console.error('Error creating store', event);
  };
};

// we will use this function to add data to our indexedDB
export const addData = <T>(storeName: StoreName, data: T) => {
  // close prev connection
  // open a new connection to the database
  request = window.indexedDB.open(DBName.Main, version);

  request.onsuccess = (_event) => {
    console.log('request.onsuccess');
    db = request.result;
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.add(data);
  };
  // request.onsuccess = (_event) => {
  //   console.log(`Data added successfully to ${storeName} store`);
  // };

  // request.onerror = (event) => {
  //   console.error('Error adding data', event);
  // };
  // const tx = db.transaction(storeName, 'readwrite');
  // const store = tx.objectStore(storeName);
  // store.add(data);
};

// we will use this function to get data from our indexedDB
export const getData = <T>(
  storeName: StoreName,
  id: string
): Promise<T | undefined> => {
  return new Promise((resolve) => {
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const dataRequest = store.get(id);
      dataRequest.onsuccess = () => {
        resolve(dataRequest.result);
      };
    };
  });
};

// we will use this function to delete data from our indexedDB
export const deleteData = (storeName: StoreName, id: string) => {
  request.onsuccess = (_event) => {
    const db = request.result;
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    store.delete(id);
  };
};

// we will use this function to clear all data from our indexedDB
export const clearData = (storeName: StoreName) => {
  request.onsuccess = (_event) => {
    const db = request.result;
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    store.clear();
  };
};

// we will use this function to get all data from our indexedDB
export const getAllData = (storeName: StoreName) => {
  request.onsuccess = (_event) => {
    const db = request.result;
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const data = store.getAll();
    return data;
  };
};

// remove isolatedModules from tsconfig.json warning
export {};

