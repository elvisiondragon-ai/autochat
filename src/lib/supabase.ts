// Supabase client for autochat — connects to elvisiongroup as main server
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ||
    "https://nlrgdhpmsittuwiiindq.supabase.co";

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5scmdkaHBtc2l0dHV3aWlpbmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDk0NTQsImV4cCI6MjA2OTk4NTQ1NH0.62U0WBImD8aT8mJvHv4xysGsp4IyV1A4a26OlTdOpVw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/autochat-clients`;

export async function callAutochat(
    action: string,
    payload: Record<string, unknown> = {},
    session?: { access_token: string } | null
) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
    };
    if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
    }
    const res = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ action, ...payload }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error ?? "Edge function error");
    return data;
}
