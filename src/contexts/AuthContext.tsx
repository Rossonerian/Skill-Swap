import React, { createContext, useContext, useEffect, useState } from "react";

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

// 🔥 Demo Accounts
const DEMO_USERS: Record<string, User> = {
  "alex@demo.com": {
    id: "alex-id",
    email: "alex@demo.com",
    name: "Alex Johnson",
  },
  "maya@demo.com": {
    id: "maya-id",
    email: "maya@demo.com",
    name: "Maya Sharma",
  },
};

const DEMO_PASSWORD = "123456";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session
  useEffect(() => {
    const stored = localStorage.getItem("demo-session");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed.user);
      setSession(parsed);
    }
    setLoading(false);
  }, []);

  const signUp = async () => {
    return {
      error: new Error("Sign up disabled in demo mode."),
    };
  };

  const signIn = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 1200)); // fake server delay

    const demoUser = DEMO_USERS[email.toLowerCase()];

    if (!demoUser || password !== DEMO_PASSWORD) {
      return { error: new Error("Invalid demo credentials") };
    }

    const newSession = { user: demoUser };

    localStorage.setItem("demo-session", JSON.stringify(newSession));
    setUser(demoUser);
    setSession(newSession);

    return { error: null };
  };

  const signOut = async () => {
    localStorage.removeItem("demo-session");
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
