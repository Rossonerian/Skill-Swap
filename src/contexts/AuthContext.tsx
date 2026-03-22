import React, { createContext, useContext, useEffect, useState } from "react";
import { apiLogin, apiRegister } from "@/services/api";

type User = {
  id: string;
  email: string;
  name: string;
};

interface Session {
  user: User;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ error: Error | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session
  useEffect(() => {
    const stored = localStorage.getItem("skill_swap_token");
    if (stored) {
      const userJson = localStorage.getItem("skill_swap_user");
      if (userJson) {
        const parsed = JSON.parse(userJson);
        setUser(parsed);
        setSession({ user: parsed });
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { token, user: newUser } = await apiRegister(email, password, name);
      localStorage.setItem("skill_swap_token", token);
      localStorage.setItem("skill_swap_user", JSON.stringify(newUser));
      setUser(newUser);
      setSession({ user: newUser });
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message || "Failed to sign up") };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { token, user: loggedUser } = await apiLogin(email, password);
      localStorage.setItem("skill_swap_token", token);
      localStorage.setItem("skill_swap_user", JSON.stringify(loggedUser));
      setUser(loggedUser);
      setSession({ user: loggedUser });
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message || "Invalid credentials") };
    }
  };

  const signOut = async () => {
    localStorage.removeItem("skill_swap_token");
    localStorage.removeItem("skill_swap_user");
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
