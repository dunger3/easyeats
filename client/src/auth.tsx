import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { AuthUser } from './api';

interface AuthCtx {
  user: AuthUser | null;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
}

const Ctx = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const authUser = localStorage.getItem('user');
    if (token && authUser) setUser(JSON.parse(authUser));
  }, []);

  const setAuth = (authUser: AuthUser, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(authUser));
    setUser(authUser);
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, setAuth, logout, isLoggedIn: !!user, isAdmin: user?.role === 'admin' }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);

export function Navbar() {
  const { isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const signOut = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <Link className="navbar-brand" to="/">🍽 Easy<span>Eats</span></Link>
      <nav>
        <Link to="/nutrition">Nutrition</Link>
        {isAdmin && <Link to="/manage-users">Users</Link>}
        {isLoggedIn ? (
          <>
            {isAdmin && <Link to="/create">+ Add</Link>}
            <button onClick={signOut}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
