import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUsers, updateUser, deleteUser, type User, type Role } from '../api';
import { useAuth } from '../auth';

export default function ManageUsers() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ email: '', name: '', role: 'customer' as Role });
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    load();
  }, []);

  const load   = () => getUsers().then(setUsers);
  const notify = (text: string, type: 'success' | 'error' = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const startEdit = (u: User) => {
    setEditing(u);
    setForm({ email: u.email, name: u.name, role: u.role });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing)
      return;
    try {
      await updateUser(editing.user_id, form);
      notify('User updated.');
      setEditing(null);
      load();
    }
    catch (err: any) {
      notify(err.message, 'error');
    }
  };

  const del = async (u: User) => {
    if (!confirm(`Delete user "${u.email}"?`))
      return;

    try {
      await deleteUser(u.user_id);
      notify('User deleted.');
      load();
    }
    catch (err: any) {
      notify(err.message, 'error');
    }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="container">
      <Link className="back-link" to="/">← Back to Home</Link>
      <div className="page-header">
        <h1>👤 Manage Users</h1>
        <p>{users.length} registered users</p>
      </div>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {editing && (
        <div className="form-card" style={{ margin: '0 0 1.5rem' }}>
          <h2>Edit User</h2>
          <form onSubmit={save}>
            <div className="form-group"><label>Email</label>
              <input className="form-control" type="email" required value={form.email} onChange={set('email')} /></div>
            <div className="form-group"><label>Full Name</label>
              <input className="form-control" required value={form.name} onChange={set('name')} /></div>
            <div className="form-group"><label>Role</label>
              <select className="form-control" value={form.role} onChange={set('role')}>
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="row">
              <button className="btn btn-primary">Save Changes</button>
              <button type="button" className="btn" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-wrap">
        <table className="table">
          <thead><tr>
            <th>ID</th><th>Email</th><th>Name</th><th>Role</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id}>
                <td>{user.user_id}</td>
                <td>{user.email}</td>
                <td>{user.name}</td>
                <td><span className={`badge badge-${user.role}`}>{user.role}</span></td>
                <td>
                  <div className="row" style={{ gap: '.4rem' }}>
                    <button className="btn btn-sm" onClick={() => startEdit(user)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => del(user)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
