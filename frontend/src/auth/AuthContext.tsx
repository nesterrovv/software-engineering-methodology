import {createContext, useContext, useMemo, useState} from "react";
import type {ReactNode} from "react";
type AuthContextValue = {
    token: string | null;
    username: string | null;
    baseUrl: string;
    login: (username: string, token: string, baseUrl: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_TOKEN = "casino.auth.token";
const STORAGE_USER = "casino.auth.user";
const STORAGE_BASE = "casino.auth.base";

const readStorage = (key: string) => (typeof window === "undefined" ? null : localStorage.getItem(key));

export const AuthProvider = ({children}: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(readStorage(STORAGE_TOKEN));
    const [username, setUsername] = useState<string | null>(readStorage(STORAGE_USER));
    const [baseUrl, setBaseUrl] = useState<string>(readStorage(STORAGE_BASE) ?? "");

    const login = (nextUser: string, nextToken: string, nextBase: string) => {
        setToken(nextToken);
        setUsername(nextUser);
        setBaseUrl(nextBase);
        localStorage.setItem(STORAGE_TOKEN, nextToken);
        localStorage.setItem(STORAGE_USER, nextUser);
        localStorage.setItem(STORAGE_BASE, nextBase);
    };

    const logout = () => {
        setToken(null);
        setUsername(null);
        localStorage.removeItem(STORAGE_TOKEN);
        localStorage.removeItem(STORAGE_USER);
        localStorage.removeItem(STORAGE_BASE);
    };

    const value = useMemo(
        () => ({
            token,
            username,
            baseUrl,
            login,
            logout,
        }),
        [token, username, baseUrl]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};
