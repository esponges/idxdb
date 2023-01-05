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

// create the stores if they don't exist
const createOrInitDB = () => {
  request = window.indexedDB.open(DBName.Main); // keep the existing version if exists


  // onupgradeneeded is called when the database is created or the version is changed
  // the version should only change when we add, remove or modify a store
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

// we will use this function to create a new store in our indexedDB
export const initDB = () => {
  createOrInitDB();

  // discard the old connection
  request.onsuccess = (_event) => {
    // this is not needed apparently (check it)
    console.log('request.onsuccess - initDB');
    version = request.result.version;
  };
};

export const deleteDB = () => {
  request = window.indexedDB.deleteDatabase(DBName.Main);
  console.log('Attempting to delete database');
  request.onsuccess = (_event) => {
    console.log('Database deleted successfully');
  };

  request.onerror = (event) => {
    console.error('Error deleting database', event);
  }
};

// todo: fix, this one breaks the db connection
export const createStore = (storeName: StoreName) => {
  version += 1;
  request = window.indexedDB.open(DBName.Main, version); // open a new connection to the database
  console.log('createStore', storeName, 'version =', version);

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
  };

  request.onerror = (event) => {
    console.error('Error creating store', event);
  };
};

// we will use this function to add data to our indexedDB
export const addData = <T>(storeName: StoreName, data: T) => {
  // check if the store exists, if not create it
  // and then add the data
  request = window.indexedDB.open(DBName.Main);
  
  // this works!
  request.onsuccess = (_event) => {
    console.log('request.onsuccess');
    db = request.result;
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.add(data);
  };

  request.onerror = (event) => {
    console.error('Error adding data', event);
  }
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

export const getStoreData = <T>(storeName: StoreName): Promise<T[]> => {
  createOrInitDB();

  return new Promise((resolve) => {
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const dataRequest = store.getAll();
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

