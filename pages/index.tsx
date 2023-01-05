import Head from 'next/head';
import {
  StoreName,
  addData,
  initDB,
  deleteDB,
  User,
  Post,
  getStoreData,
} from '../lib/iddb';
import { useState } from 'react';
import { useRouter } from 'next/router';

interface IDBData {
  users: User[];
  posts: Post[];
}

export default function Home() {
  const [users, setUsers] = useState<Pick<IDBData, 'users'>[]>();
  const router = useRouter();

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      name: { value: string };
      email: { value: string };
    };
    const name = target.name.value;
    const email = target.email.value;
    const id = Math.random().toString(36);

    addData(StoreName.Users, { name, email, id });

    // target.name.value = '';
    // target.email.value = '';
  };

  const handleGetStoreData = async (storeName: StoreName) => {
    const IDBUsers = await getStoreData<Pick<IDBData, 'users'>>(storeName);
    setUsers(IDBUsers);
  };

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name='description' content='Generated by create next app' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main>
        {/* create a form to add user data */}
        <form
          onSubmit={handleAddUser}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <label htmlFor='name'>Name</label>
          <input type='text' name='name' id='name' />
          <label htmlFor='email'>Email</label>
          <input type='email' name='email' id='email' />
          <button type='submit'>Add User</button>
        </form>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <button onClick={() => initDB()}>Init DB</button>
          <button onClick={() => deleteDB()}>Delete DB</button>
          <button onClick={() => handleGetStoreData(StoreName.Users)}>
            Get Users
          </button>
        </div>
      </main>
    </>
  );
}
