import React, { createContext, useContext, useEffect, useState } from "react";
import { account } from "@/integrations/appwrite/client";

interface User {
  $id: string;
  email: string;
  name?: string;
}

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
        const currentUser = await account.get();
        setUser(currentUser as User);
        setSession({ user: currentUser as User });
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
      // Create user account
      const newUser = await account.create("unique()", email, password, name);
      
      // Auto sign in after signup
      await account.createEmailPasswordSession(email, password);
      
      setUser(newUser as User);
      setSession({ user: newUser as User });
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const currentUser = await account.get();
      
      setUser(currentUser as User);
      setSession({ user: currentUser as User });
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      await account.deleteSession("current");
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
