import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api';
import { useAuth } from '../auth';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const set = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { access_token, user } = await register({
        name: form.name, email: form.email, password: form.password,
      });
      setAuth(user, access_token);
      navigate('/');
    }
    catch (err: any) {
      setError(err.message);
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Link className="back-link" to="/">← Back to Home</Link>
      <div className="form-card">
        <h2>Create Account</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-group"><label>Full Name</label>
            <input className="form-control" required value={form.name} onChange={set('name')} /></div>
          <div className="form-group"><label>Email</label>
            <input className="form-control" type="email" required value={form.email} onChange={set('email')} /></div>
          <div className="form-group"><label>Password <span className="hint">(min 6 chars)</span></label>
            <input className="form-control" type="password" required minLength={6}
              value={form.password} onChange={set('password')} /></div>
          <div className="form-group"><label>Confirm Password</label>
            <input className="form-control" type="password" required value={form.confirm} onChange={set('confirm')} /></div>
          <button className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </form>
        <p className="form-footer">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}
