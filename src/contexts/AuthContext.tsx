import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUserFromSession,
  localSignIn,
  localSignOut,
  localSignUp,
  LocalUser,
} from "@/services/localDb";

type User = Pick<LocalUser, "id" | "email" | "name">;

interface Session {
  user: User;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const currentUser = getCurrentUserFromSession();
        if (currentUser) {
          const normalizedUser: User = {
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.name,
          };
          setUser(normalizedUser);
          setSession({ user: normalizedUser });
        } else {
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        // No active session
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { user: createdUser, error } = await localSignUp(email, password, name);
      if (error || !createdUser) {
        return { error };
      }

      const normalizedUser: User = {
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
      };

      setUser(normalizedUser);
      setSession({ user: normalizedUser });

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { user: signedInUser, error } = await localSignIn(email, password);
      if (error || !signedInUser) {
        return { error };
      }

      const normalizedUser: User = {
        id: signedInUser.id,
        email: signedInUser.email,
        name: signedInUser.name,
      };

      setUser(normalizedUser);
      setSession({ user: normalizedUser });

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      await localSignOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
