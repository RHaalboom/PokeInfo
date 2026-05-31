import { createContext } from "react";

/**
 * Auth Context Shape:
 * {
 *   isAuthenticated: boolean,
 *   user: User | null,
 *   login: (userData: User) => void,
 *   logout: () => void,
 *   updateUser: (userData: Partial<User>) => void
 * }
 */
export const AuthContext = createContext(null);