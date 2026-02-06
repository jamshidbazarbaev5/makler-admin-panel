import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";
import { getAccessToken } from "../api/auth";
import type { CurrentUser } from "../hooks/useCurrentUser.ts";

interface AuthContextType {
    currentUser: CurrentUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

// Helper function to decode JWT and extract user ID
const getUserIdFromToken = (token: string): number | null => {
    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        return decoded.user_id || decoded.sub || decoded.id || null;
    } catch (error) {
        console.error("[AuthContext] Error decoding token:", error);
        return null;
    }
};

// Create a context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                          children,
                                                                      }) => {
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    // Function to fetch current user data
    const fetchCurrentUser = async (): Promise<CurrentUser | null> => {
        console.log("[AuthContext] Fetching current user");
        try {
            const token = getAccessToken();
            if (!token) {
                console.log("[AuthContext] No token found, user is not authenticated");
                return null;
            }

            const userId = getUserIdFromToken(token);
            if (!userId) {
                console.log("[AuthContext] Could not extract user ID from token");
                return null;
            }

            const response = await api.get(`staff/${userId}/`);
            console.log("[AuthContext] User data fetched successfully");
            return response.data;
        } catch (error) {
            console.error("[AuthContext] Error fetching user data:", error);

            // If we get a 401 or any auth error, clear tokens to prevent loops
            const token = getAccessToken();
            if (token) {
                console.log("[AuthContext] Clearing invalid tokens");
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
            }

            return null;
        }
    };

    // Function to refresh user data
    const refreshUser = async (): Promise<void> => {
        setIsLoading(true);
        try {
            const userData = await fetchCurrentUser();
            setCurrentUser(userData);
        } catch (error) {
            console.error("[AuthContext] Error refreshing user:", error);
            setCurrentUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Initialize auth state
    useEffect(() => {
        console.log("[AuthContext] Initializing auth state");
        let isMounted = true;

        const initializeAuth = async () => {
            setIsLoading(true);
            try {
                const userData = await fetchCurrentUser();
                if (isMounted) {
                    setCurrentUser(userData);
                    console.log(
                        "[AuthContext] Auth initialized with user:",
                        userData?.username,
                    );
                }
            } catch (error) {
                console.error("[AuthContext] Error during auth initialization:", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                    setIsInitialized(true);
                }
            }
        };

        initializeAuth();

        return () => {
            isMounted = false;
        };
    }, []);

    // Login function - set token and fetch user
    const login = async (token: string): Promise<void> => {
        console.log("[AuthContext] Login called, setting token and fetching user");
        localStorage.setItem("access_token", token);
        await refreshUser();
    };

    // Logout function - clear token and user
    const logout = (): void => {
        console.log("[AuthContext] Logout called, clearing auth data");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setCurrentUser(null);
    };

    // Calculate authentication status
    const isAuthenticated = !!currentUser;

    // Provide auth context value
    const value = {
        currentUser,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {isInitialized ? children : <div>Initializing application...</div>}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
