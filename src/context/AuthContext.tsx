"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "../lib/types/auth";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, name?: string) => Promise<void>;
  signup: (email: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = "websic_auth_user_v1";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      } else {
        // Default guest user
        const guestUser: User = {
          id: "guest-user",
          name: "Guest Listener",
          email: "guest@websic.local",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          createdAt: new Date().toISOString(),
        };
        setUser(guestUser);
      }
    } catch (e) {
      console.warn("Failed to read user auth state:", e);
    }
  }, []);

  const login = async (email: string, name?: string) => {
    const loggedUser: User = {
      id: `usr_${Date.now()}`,
      name: name || email.split("@")[0],
      email,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      createdAt: new Date().toISOString(),
    };
    setUser(loggedUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser));
    setIsAuthModalOpen(false);
  };

  const signup = async (email: string, name: string) => {
    return login(email, name);
  };

  const logout = () => {
    const guestUser: User = {
      id: "guest-user",
      name: "Guest Listener",
      email: "guest@websic.local",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      createdAt: new Date().toISOString(),
    };
    setUser(guestUser);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && user.id !== "guest-user",
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
