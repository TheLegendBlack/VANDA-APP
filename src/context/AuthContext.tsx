// src/context/AuthContext.tsx

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { loginApi, fetchMe, MeResponse } from '../api/auth';

const AUTH_TOKEN_KEY = 'vanda_auth_token';

type AuthContextValue = {
  user: MeResponse | null;
  token: string | null;
  initializing: boolean; // au démarrage : lecture du token + /users/me
  authLoading: boolean;  // pendant login/logout explicite
  login: (phoneNumber: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  // 🔐 Lecture du token + préchargement du profil au démarrage
  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
        if (!storedToken) {
          if (isMounted) {
            setToken(null);
            setUser(null);
          }
          return;
        }

        if (isMounted) setToken(storedToken);

        try {
          const me = await fetchMe(storedToken);
          if (isMounted) setUser(me);
        } catch (err) {
          console.warn('Token invalide ou expiré, on nettoie.', err);
          await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
          if (isMounted) {
            setToken(null);
            setUser(null);
          }
        }
      } finally {
        if (isMounted) setInitializing(false);
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  // ✅ Login : appelle /auth/login, sauvegarde le token, charge /users/me
  const login = useCallback(async (phoneNumber: string, password: string) => {
    setAuthLoading(true);
    try {
      const res = await loginApi(phoneNumber, password);

      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, res.token);
      setToken(res.token);

      try {
        const me = await fetchMe(res.token);
        setUser(me);
      } catch (err) {
        console.warn('Login OK mais impossible de charger /users/me', err);
        // On laisse le token, l’app peut fonctionner en mode "semi-connecté"
      }
    } catch (err: any) {
      // On propage pour que l’écran affiche un message
      throw new Error(err?.message ?? "Impossible de se connecter.");
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // 🚪 Logout : supprime le token partout
  const logout = useCallback(async () => {
    setAuthLoading(true);
    try {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // 🔄 Permet de rafraîchir /users/me à la demande (ex: après édition de profil)
  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const me = await fetchMe(token);
      setUser(me);
    } catch (err) {
      console.warn('Erreur lors du refresh du profil, on garde le user actuel.', err);
    }
  }, [token]);

  const value: AuthContextValue = {
    user,
    token,
    initializing,
    authLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth doit être utilisé à l’intérieur de <AuthProvider>.');
  }
  return ctx;
}

// Export de la clé si jamais tu veux la réutiliser ailleurs
export { AUTH_TOKEN_KEY };
