import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

interface AutochatClient {
    id: string;
    user_id: string;
    email: string;
    display_name: string;
    phone_number: string;
    status: "free" | "paid";
    meta_access_token?: string | null;
    meta_page_id?: string | null;
    meta_instagram_id?: string | null;
    ig_profile_pic_url?: string | null;
    updated_at: string;
}

interface AppContextType {
    session: Session | null;
    user: User | null;
    client: AutochatClient | null;
    is_pro: boolean;
    loading: boolean;
    refreshClient: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [client, setClient] = useState<AutochatClient | null>(null);
    const [loading, setLoading] = useState(true);

    const is_pro = client?.status === "paid";

    const fetchClient = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from("autochat_clients")
                .select("*")
                .eq("user_id", userId)
                .single();

            if (error && error.code !== "PGRST116") {
                console.error("[AppContext] Error fetching client:", error);
            } else if (data) {
                setClient(data as AutochatClient);
                // Store in localStorage for fast initial load
                localStorage.setItem(`autochat-client-${userId}`, JSON.stringify(data));
            }
        } catch (err) {
            console.error("[AppContext] Catch fetching client:", err);
        }
    };

    const refreshClient = async () => {
        if (user) await fetchClient(user.id);
    };

    useEffect(() => {
        // 1. Initial Session Check
        supabase.auth.getSession().then(({ data: { session: s } }) => {
            setSession(s);
            setUser(s?.user ?? null);

            if (s?.user) {
                // Try to load from localStorage first
                const cached = localStorage.getItem(`autochat-client-${s.user.id}`);
                if (cached) {
                    setClient(JSON.parse(cached));
                }
                fetchClient(s.user.id).finally(() => setLoading(false));
            } else {
                setLoading(false);
            }
        });

        // 2. Auth Listener
        const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange((_event, s) => {
            setSession(s);
            setUser(s?.user ?? null);
            if (s?.user) {
                fetchClient(s.user.id);
            } else {
                setClient(null);
                setLoading(false);
            }
        });

        return () => {
            authListener.unsubscribe();
        };
    }, []);

    // 3. Real-time Profile Sync
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel(`sync-autochat-client-${user.id}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "autochat_clients",
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    console.log("[AppContext] Client updated in real-time:", payload.new);
                    const updatedClient = payload.new as AutochatClient;
                    setClient(updatedClient);
                    localStorage.setItem(`autochat-client-${user.id}`, JSON.stringify(updatedClient));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    return (
        <AppContext.Provider
            value={{
                session,
                user,
                client,
                is_pro,
                loading,
                refreshClient,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};
