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

// Mock user data for development
const mockUser = {
  id: '1',
  email: 'user@example.com',
  user_metadata: {
    avatar_url: null
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<any | null>({ user: mockUser });
  const [user, setUser] = useState<any | null>(mockUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Authentication is disabled - always set user as authenticated
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Authentication disabled - do nothing
    console.log('Login disabled for development');
  };

  const signUp = async (email: string, password: string) => {
    // Authentication disabled - do nothing
    console.log('Signup disabled for development');
  };

  const signOut = async () => {
    // Authentication disabled - do nothing
    console.log('Logout disabled for development');
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