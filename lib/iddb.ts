export enum DBName {
  Main = "main",
}

export enum StoreName {
  Users = "users",
  Posts = "posts",
  News = "news",
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

// we will use this function to create a new store in our indexedDB
export const createDB = () => {
  request = window.indexedDB.open(DBName.Main, version); // open a new connection to the database
  /* 
  onupgradeneeded is called when the database is created or the version is changed
  the version should only change when we add, remove or modify a store

  in this case this function will be called only when we start the app for the first time
  or when we change the version of the database
  */
  request.onupgradeneeded = (_event) => {
    db = request.result;
    if (!db.objectStoreNames.contains(StoreName.Users)) {
      console.log(`Creating ${StoreName.Users} store`);
      db.createObjectStore(StoreName.Users, { keyPath: "id" });
    }
    if (!db.objectStoreNames.contains(StoreName.Posts)) {
      console.log(`Creating ${StoreName.Posts} store`);
      db.createObjectStore(StoreName.Posts, { keyPath: "id" });
    }
  };
}

export const createStore = (storeName: StoreName) => {
  version += 1;
  console.log('version', version);
  request = window.indexedDB.open(DBName.Main, version); // open a new connection to the database

  request.onupgradeneeded = (_event) => {
    db = request.result;
    if (!db.objectStoreNames.contains(storeName)) {
      console.log(`Creating ${storeName} store`);
      db.createObjectStore(storeName, { keyPath: "id" });
    }
  };

  request.onsuccess = (_event) => {
    console.log(`Store ${storeName} created successfully`);
  };

  request.onerror = (event) => {
    console.error('Error creating store', event);
  }
}

// we will use this function to add data to our indexedDB
export const addData = <T>(storeName: StoreName, data: T) => {
  // if the database is not created yet, we will create it
  // todo: confirm that works
  request.onupgradeneeded = (_event) => {
    const db = request.result;
    if (!db.objectStoreNames.contains(storeName)) {
      db.createObjectStore(storeName, { keyPath: "id" });
    }
  };

  // todo: confirm that works
  request.onsuccess = (_event) => {
    if (request.readyState === "done") {
      const db = request.result;
      // idb operations are transactional by default
      const transaction = db.transaction(storeName, "readwrite");
      // where we will store our data
      const store = transaction.objectStore(storeName);
      // add data to our store
      const addRequest = store.add(data);

      addRequest.onsuccess = () => {
        console.log("Data added successfully");
        // commit mutation or it will be rollbacked
        transaction.commit();
      };
    }
  };
  
  // check if there is an error
  request.onerror = (event) => {
    console.error('Error adding data', event);
  }
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
