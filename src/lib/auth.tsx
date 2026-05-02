import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export const ADMIN_EMAIL = 'pedro.souza04101993@gmail.com';

type AuthCtx = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const login = async () => {
    await signInWithPopup(auth, googleProvider);
  };
  const logout = async () => {
    await signOut(auth);
  };

  return (
    <Ctx.Provider value={{ user, loading, isAdmin, login, logout }}>{children}</Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
