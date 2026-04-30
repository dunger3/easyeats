import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api';
import { useAuth } from '../auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { access_token, user } = await login(email, password);
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
        <h2>Welcome back</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Email</label>
            <input className="form-control" type="email" required
              value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" required
              value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" />
          </div>
          <button className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>
        <p className="form-footer">Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}
