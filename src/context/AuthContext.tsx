"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchLoginData,
  fetchLogout,
  validateToken,
} from "../utils/fetch-functions";

// === Typen ===
interface User {
  userID: string;
  userMail: string;
  userRole: string[];
}

interface AuthContextType {
  isAdminLoggedIn: boolean;
  isUserLoggedIn: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// === AuthProvider ===
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  // User-Daten laden und cachen
  const { data: user, isError } = useQuery<User | null>({
    queryKey: ["auth"],
    queryFn: validateToken,
    staleTime: 5 * 60 * 1000, // 5 Minuten Cache
    retry: false, // Keine Wiederholungsversuche bei 401
  });

  // Berechne die Login-States
  const isAdminLoggedIn = !!user?.userRole.includes("ADMIN") && !isError;
  const isUserLoggedIn = !!user?.userRole.includes("USER") && !isError;

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const res = await fetchLoginData({ email, password });

        if (res.ok) {
          // Invalidiere den Cache und lade neue User-Daten
          await queryClient.invalidateQueries({ queryKey: ["auth"] });
          return true;
        }
        return false;
      } catch (error) {
        console.error("Login error:", error);
        return false;
      }
    },
    [queryClient]
  );

  const logout = useCallback(async () => {
    try {
      const res = await fetchLogout();

      if (res.ok) {
        // Setze Auth-Daten zurück
        queryClient.setQueryData(["auth"], null);
        // Invalidiere alle gecachten Queries
        queryClient.clear();
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        isAdminLoggedIn,
        isUserLoggedIn,
        user: user ?? null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useIsAuthenticated = () => {
  const { isAdminLoggedIn, isUserLoggedIn } = useAuth();
  return isAdminLoggedIn || isUserLoggedIn;
};
