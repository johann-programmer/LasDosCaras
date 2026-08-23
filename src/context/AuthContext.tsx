import { createContext, type ReactNode } from "react";
import useAuth from "../hooks/useAuth";

type AuthContextType = ReturnType<typeof useAuth>;

export const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}