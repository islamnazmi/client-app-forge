import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

const SESSION_KEY = 'user_session_token';

interface User {
  id: string;
  name: string;
  email: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for a session on initial load
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        setUser(JSON.parse(session));
      }
    } catch (error) {
      console.error("Failed to parse user session", error);
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAuthResponse = (data: any) => {
    if (data.success && data.token) {
      const loggedInUser = {
        id: data.user_id || `user_${Date.now()}`,
        name: data.name || 'User',
        email: data.email,
        token: data.token,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      navigate('/');
    } else {
      throw new Error(data.message || 'An unknown error occurred.');
    }
  };

  const signIn = async (email: string, password: string) => {
    const response = await fetch('https://api.hirempire.com/v1/form?way=signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    handleAuthResponse(data);
  };

  const signUp = async (name: string, email: string, password: string) => {
    const response = await fetch('https://api.hirempire.com/v1/form?way=signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    handleAuthResponse(data);
  };

  const signOut = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    navigate('/signin');
  };

  const value = { user, loading, signIn, signUp, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};