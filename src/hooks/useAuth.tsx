"use client";

import { createClientClient } from "@/utils/supabase/client";
import {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

type AuthContextType = {
    userId: string | undefined;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [userId, setUserId] = useState<string | undefined>(undefined);

    const loadAuthUser = async () => {
        const supabase = createClientClient();

        const user = await supabase.auth.getUser();

        if (!user.error && user.data && user.data.user) {
            setUserId(user.data.user.id);
        } else {
            setUserId(undefined);
        }
    };

    useEffect(() => {
        loadAuthUser();
    }, []);

    return (
        <AuthContext.Provider value={{ userId }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within a AuthProvider");
    }

    return context;
};
