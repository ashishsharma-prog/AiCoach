import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  session: any | null;
  user: any | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch session/user from your backend if needed
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // TODO: Replace with your backend API call
    // Example:
    // const response = await fetch('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    // if (!response.ok) throw new Error('Login failed');
    // const data = await response.json();
    // setSession(data.session); setUser(data.user);
    throw new Error('signIn not implemented');
  };

  const signUp = async (email: string, password: string) => {
    // TODO: Replace with your backend API call
    throw new Error('signUp not implemented');
  };

  const signOut = async () => {
    // TODO: Replace with your backend API call
    setSession(null);
    setUser(null);
  };

  const value = {
    session,
    user,
    signIn,
    signUp,
    signOut,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 