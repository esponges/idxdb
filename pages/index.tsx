import { useState } from 'react';
import { Stores, User, addData, getStoreData, initDB } from '../lib/db';

export default function Home() {
  const [isDBReady, setIsDBReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]|[]>([]);

  const handleInitDB = async () => {
    const status = await initDB();
    setIsDBReady(!!status);
  };

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const target = e.target as typeof e.target & {
      name: { value: string };
      email: { value: string };
    };

    const name = target.name.value;
    const email = target.email.value;
    const id = Date.now();

    if (name.trim() === '' || email.trim() === '') {
      alert('Please enter a valid name and email');
      return;
    }

    try {
      const res = await addData(Stores.Users, { name, email, id });
      // refetch users after creating data
      handleGetUsers();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong');
      }
    }
  };

  const handleGetUsers = async () => {
    const users = await getStoreData<User>(Stores.Users);
    setUsers(users);
  };

  return (
    <main style={{ textAlign: 'center', marginTop: '3rem' }}>
      <h1>IndexedDB</h1>
      {!isDBReady ? (
        <button onClick={handleInitDB}>Init DB</button>
      ) : (
        <>
          <h2>DB is ready</h2>
          {/* add user form */}
          <form onSubmit={handleAddUser}>
            <input type="text" name="name" placeholder="Name" />
            <input type="email" name="email" placeholder="Email" />
            <button type="submit">Add User</button>
          </form>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button onClick={handleGetUsers}>Get Users</button>
          {users.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>ID</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </main>
  );
}
