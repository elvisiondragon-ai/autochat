import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Zap, LayoutDashboard, FileText, Settings, LogOut, Facebook,
  CheckCircle2, XCircle, RefreshCw, Unplug, ChevronDown, MessageSquare,
  Instagram, MoreHorizontal, Users, TrendingUp, Crown, Loader2, Lock, Plus, Trash2, Sun, Moon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

// ── Mock demo data (always shown so visitors can feel the dashboard) ──────────
import { AutomationWizard } from "@/components/AutomationWizard";

const mockPages = [
  { id: "1", name: "El Vision Store", category: "E-Commerce", isActive: true, hasInstagram: true, followers: "12.4K", messagesThisMonth: 1847 },
  { id: "2", name: "El Vision Blog", category: "Media/News", isActive: true, hasInstagram: false, followers: "5.2K", messagesThisMonth: 423 },
  { id: "3", name: "El Vision Support", category: "Business", isActive: false, hasInstagram: true, followers: "2.1K", messagesThisMonth: 0 },
];

const sidebarItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "pages", icon: FileText, label: "Pages" },
  { id: "automations", icon: MessageSquare, label: "Automations" },
  { id: "audience", icon: Users, label: "Audience" },
  { id: "analytics", icon: TrendingUp, label: "Analytics" },
  { id: "settings", icon: Settings, label: "Settings" },
];

// Mobile bottom tabs (5 items, matching DemoPanel)
const bottomTabs = [
  { id: "dashboard", icon: LayoutDashboard, label: "Home" },
  { id: "automations", icon: MessageSquare, label: "Bot" },
  { id: "analytics", icon: TrendingUp, label: "Analitik" },
  { id: "audience", icon: Users, label: "Audience" },
  { id: "settings", icon: Settings, label: "Profil" },
];

interface AutochatTrigger {
  id: string;
  user_id?: string;
  keyword: string;
  is_any_word?: boolean;
  is_active: boolean;
  trigger_source?: string;
  target_post?: string;
  comment_reply?: string;
  comment_reply_2?: string;
  comment_reply_3?: string;

  step4_text?: string;
  step4_button_type?: "quick_reply" | "web_url";
  step4_button1_text?: string;
  step4_button1_url?: string;
  step4_button2_text?: string;
  step4_button2_url?: string;

  step5_text?: string;
  step5_button_type?: "quick_reply" | "web_url";
  step5_button1_text?: string;
  step5_button1_url?: string;
  step5_button2_text?: string;
  step5_button2_url?: string;

  step6_text?: string;
  step6_button_text?: string;
  step6_button_url?: string;
}

interface AutochatClient {
  display_name?: string;
  email?: string;
  phone_number?: string;
  status?: "free" | "paid";
  meta_access_token?: string | null;
  meta_page_id?: string | null;
  meta_instagram_id?: string | null;
  ig_profile_pic_url?: string | null;
}

// Ensure FB SDK is typed on window
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export interface AutochatAudienceLog {
  id: string;
  ig_username: string;
  follow_status: string;
  interaction_type: string;
  auto_chat_status: string;
  interaction_text?: string;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [client, setClient] = useState<AutochatClient | null>(null);
  const [triggers, setTriggers] = useState<AutochatTrigger[]>([]);
  const [audienceLogs, setAudienceLogs] = useState<AutochatAudienceLog[]>([]);
  const [authLoading, setAuthLoading] = useState(true);

  // UI State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAddingTrigger, setIsAddingTrigger] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<AutochatTrigger | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Settings State
  const [settingsName, setSettingsName] = useState("");
  const [settingsPhone, setSettingsPhone] = useState("");
  const [settingsEmail, setSettingsEmail] = useState("");
  const [settingsPassword, setSettingsPassword] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    if (client) {
      setSettingsName(client.display_name || "");
      setSettingsPhone(client.phone_number || "");
    }
    if (session?.user?.email) {
      setSettingsEmail(session.user.email);
    }
  }, [client, session]);

  // Theme State
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Check saved theme or default to dark
    const savedTheme = localStorage.getItem("autochat-theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      document.documentElement.classList.add("dark");
    }
    supabase.auth.getSession().then(async ({ data }) => {
      const s = data.session;
      setSession(s ?? null);
      if (s) {
        try {
          const { data: cData } = await supabase
            .from("autochat_clients")
            .select("*")
            .eq("user_id", s.user.id)
            .single();
          if (cData) setClient(cData);

          fetchTriggers(s.user.id);
          fetchAudienceLogs(s.user.id);
        } catch {/* non-blocking */ }
      }
      setAuthLoading(false);
    });

    // Load FB SDK
    if (!document.getElementById('facebook-jssdk')) {
      console.log("[AutoChat] Initializing Facebook SDK script...");
      window.fbAsyncInit = function () {
        console.log("[AutoChat] fbAsyncInit called, initializing FB object.");
        window.FB.init({
          appId: '1234463122198129', // Meta App ID
          cookie: true,
          xfbml: true,
          version: 'v22.0'
        });
        console.log("[AutoChat] FB SDK initialized successfully.");
      };

      const js = document.createElement('script');
      js.id = 'facebook-jssdk';
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      js.async = true;
      js.defer = true;
      js.onerror = () => {
        console.error("[AutoChat] Failed to load Facebook SDK. Ad-blocker might be active.");
      };

      const fjs = document.getElementsByTagName('script')[0];
      if (fjs && fjs.parentNode) {
        fjs.parentNode.insertBefore(js, fjs);
      } else {
        document.body.appendChild(js);
      }
    } else {
      console.log("[AutoChat] Facebook SDK script tag already exists.");
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const connectToMeta = () => {
    console.log("[AutoChat] connectToMeta clicked. Checking window.FB:", !!window.FB);

    if (!window.FB) {
      toast({
        title: "Facebook SDK belum siap",
        description: "Matikan ad-blocker atau refresh halaman lalu coba lagi.",
        variant: "destructive"
      });
      return;
    }

    console.log("[AutoChat] Triggering FB.login popup...");

    // Use a try-catch to catch synchronous errors, and handle the asynchronous response
    try {
      window.FB.login(function (response: any) {
        console.log("[AutoChat] FB.login response:", response);

        if (response.authResponse) {
          toast({ title: "Terhubung ke Facebook!", description: "Menyimpan token..." });

          const saveToken = async () => {
            try {
              const userAccessToken = response.authResponse.accessToken;
              console.log("[AutoChat] Fetching Pages with Page Access Tokens...");

              // Fetch user's pages WITH their Page Access Tokens (access_token field)
              const pbRes = await fetch(`https://graph.facebook.com/v22.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${userAccessToken}`);
              const pbData = await pbRes.json();

              let metaPageId = null;
              let metaInstagramId = null;
              let pageAccessToken = null; // This is the token that NEVER expires

              if (pbData.data && pbData.data.length > 0) {
                // Find first page with an associated IG account
                const pageWithIg = pbData.data.find((p: any) => p.instagram_business_account?.id);
                if (pageWithIg) {
                  metaPageId = pageWithIg.id;
                  metaInstagramId = pageWithIg.instagram_business_account.id;
                  pageAccessToken = pageWithIg.access_token; // Page Token = never expires!
                  console.log(`[AutoChat] Found IG Account: ${metaInstagramId} on Page: ${metaPageId}`);
                  console.log(`[AutoChat] Got Page Access Token (never expires): ${pageAccessToken?.substring(0, 10)}...`);
                } else {
                  console.warn("[AutoChat] No Instagram Business Account found on any connected Facebook Pages.");
                  toast({
                    title: "Instagram Tidak Ditemukan",
                    description: "Pastikan akun Instagram Anda diset ke 'Profesional' dan terhubung ke Halaman Facebook Anda.",
                    variant: "destructive"
                  });
                }
              }

              // Use Page Token (never expires) instead of User Token (expires in 1 hour)
              const tokenToSave = pageAccessToken || userAccessToken;
              console.log("[AutoChat] Saving Page Access Token to supabase...");
              const { error } = await supabase
                .from("autochat_clients")
                .update({
                  meta_access_token: tokenToSave,
                  meta_page_id: metaPageId,
                  meta_instagram_id: metaInstagramId
                })
                .eq("user_id", session?.user.id);

              if (error) throw error;

              console.log("[AutoChat] Page Access Token saved successfully in DB (never expires!)");
              setClient(prev => prev ? {
                ...prev,
                meta_access_token: tokenToSave,
                meta_page_id: metaPageId,
                meta_instagram_id: metaInstagramId
              } : null);

              if (metaInstagramId) {
                toast({ title: "Sukses tersambung ke Meta!", description: "Instagram & Facebook berhasil dihubungkan." });
              }
            } catch (err: any) {
              console.error("[AutoChat] Connection save error:", err);

              // Handle specific Postgres unique constraint exception
              if (err.message && err.message.includes("akun sudah digunakan di")) {
                toast({
                  title: "Akun Telah Digunakan",
                  description: err.message,
                  variant: "destructive",
                  duration: 6000
                });
              } else {
                toast({ title: "Gagal menyimpan koneksi Meta", description: err.message, variant: "destructive" });
              }
            }
          };
          saveToken();

        } else {
          console.warn("[AutoChat] User cancelled login or did not fully authorize. Response:", response);
          toast({ title: "Login Facebook dibatalkan", description: "Anda menutup pop-up atau tidak memberikan izin.", variant: "destructive" });
        }
      }, {
        // Required scopes for complete Instagram & FB publishing and analytics
        scope: 'business_management,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement,pages_manage_posts,read_insights,instagram_basic,instagram_manage_messages,instagram_manage_comments,instagram_content_publish',
        return_scopes: true
      });
    } catch (err) {
      console.error("[AutoChat] Error calling FB.login:", err);
      toast({ title: "Error memuat Pop-Up", description: "Browser Anda memblokir script Meta.", variant: "destructive" });
    }
  };

  const fetchAudienceLogs = async (userId: string) => {
    const { data: logsData } = await supabase
      .from("autochat_audience_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (logsData) setAudienceLogs(logsData);
  };

  const fetchTriggers = async (userId: string) => {
    const { data: tData } = await supabase
      .from("autochat_triggers")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (tData) setTriggers(tData);
  };

  const handleDeleteTrigger = async (id: string) => {
    if (!session?.user) return;
    try {
      const { error } = await supabase.from("autochat_triggers").delete().eq("id", id).eq("user_id", session.user.id);
      if (error) throw error;
      toast({ title: "Trigger dihapus" });
      setTriggers(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      toast({ title: "Gagal menghapus", description: err.message, variant: "destructive" });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return requireLogin();

    setIsUpdatingProfile(true);
    let successMessage = "Profil berhasil diperbarui.";

    try {
      // 1. Update Auth Email & Password if changed
      if (settingsEmail !== session.user.email || settingsPassword.trim() !== "") {
        const authUpdates: { email?: string; password?: string } = {};
        if (settingsEmail !== session.user.email) authUpdates.email = settingsEmail;
        if (settingsPassword.trim() !== "") authUpdates.password = settingsPassword;

        const { error: authError } = await supabase.auth.updateUser(authUpdates);
        if (authError) throw authError;

        if (authUpdates.email) {
          successMessage += " Cek inbox Anda untuk konfirmasi perubahan email.";
        }
        setSettingsPassword(""); // Clear password field after success
      }

      // 2. Update Autochat_clients Profile
      const { error: clientError } = await supabase
        .from("autochat_clients")
        .update({
          display_name: settingsName,
          phone_number: settingsPhone
        })
        .eq("user_id", session.user.id);

      if (clientError) throw clientError;

      // Update Local State
      setClient(prev => prev ? { ...prev, display_name: settingsName, phone_number: settingsPhone } : null);

      toast({ title: "Update Sukses", description: successMessage });
    } catch (err: any) {
      toast({ title: "Gagal Update", description: err.message, variant: "destructive" });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const disconnectMeta = async () => {
    try {
      const { error } = await supabase
        .from("autochat_clients")
        .update({ meta_access_token: null, meta_page_id: null, meta_instagram_id: null })
        .eq("user_id", session?.user.id);
      if (error) throw error;

      setClient(prev => prev ? { ...prev, meta_access_token: null, meta_page_id: null, meta_instagram_id: null } : null);
      toast({ title: "Terputus dari Meta" });
    } catch (err: any) {
      toast({ title: "Gagal memutus Meta", description: err.message, variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Berhasil keluar" });
    navigate("/auth");
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("autochat-theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const isLoggedIn = !!session;
  const isPaid = client?.status === "paid";
  const isMetaConnected = !!client?.meta_access_token;
  const displayName = client?.display_name ?? session?.user?.email?.split("@")[0] ?? "Demo User";
  const initials = displayName.slice(0, 2).toUpperCase();
  const igProfilePic = client?.ig_profile_pic_url ?? null;

  // Called on protected action buttons
  const requireLogin = () => {
    toast({
      title: "Login diperlukan",
      description: "Silahkan masuk untuk menggunakan fitur ini.",
    });
    navigate("/auth");
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden md:flex-row bg-background">
      {/* Sidebar (Desktop Only) */}
      <aside className="hidden md:flex fixed left-0 top-0 z-40 h-full w-64 flex-col border-r border-border bg-card shadow-[4px_0_24px_-4px_rgba(0,0,0,0.05)] dark:shadow-none transition-colors duration-300">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-8 w-8 items-center justify-center">
            <img src="/autochat.png" alt="Autochat Logo" className="h-7 w-7 object-contain drop-shadow-md" />
          </div>
          <span className="font-display text-lg font-bold text-foreground">
            Autochat <span className="text-gradient">El Vision</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${activeTab === item.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-border p-3 space-y-2">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <div className="flex items-center gap-3">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </div>
          </button>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${theme === "light"
                ? "bg-red-600 text-white hover:bg-red-700 shadow-md"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          ) : (
            <Button className="w-full gap-2" size="sm" onClick={() => navigate("/auth")}>
              <Lock className="h-4 w-4" />
              Masuk / Daftar
            </Button>
          )}
        </div>
      </aside>

      {/* Main area — scrolls internally so the bottom nav stays fixed */}
      <main className="flex flex-col flex-1 md:ml-64 w-full overflow-y-auto">
        {/* Header — Desktop only */}
        <header className="hidden md:flex sticky top-0 z-30 h-16 items-center justify-between border-b border-border bg-background/80 px-8 backdrop-blur-xl flex-shrink-0">
          <h1 className="font-display text-xl font-semibold text-foreground">Dashboard</h1>
          <div className="flex items-center gap-3">
            {/* Connection status */}
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm">
              {isLoggedIn ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-foreground">Connected</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                  <span className="text-muted-foreground">Demo Mode</span>
                </>
              )}
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground overflow-hidden">
              {authLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : igProfilePic ? (
                <img src={igProfilePic} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                initials.slice(0, 1)
              )}
            </div>
          </div>
        </header>

        {/* Header — Mobile only (compact) */}
        <header className="md:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-xl flex-shrink-0">
          <div className="flex items-center gap-2">
            <img src="/autochat.png" alt="Autochat" className="h-6 w-6 object-contain" />
            <span className="font-display text-base font-bold text-foreground">
              Autochat <span className="text-gradient">El Vision</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <div
              className="h-8 w-8 rounded-full overflow-hidden border-2 border-border bg-secondary flex items-center justify-center text-xs font-bold text-foreground cursor-pointer flex-shrink-0"
              onClick={() => setActiveTab("settings")}
            >
              {authLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : igProfilePic ? (
                <img src={igProfilePic} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                initials.slice(0, 1)
              )}
            </div>
          </div>
        </header>

        <div className="p-4 pb-24 md:p-8 md:pb-8 overflow-x-hidden max-w-full">

          {/* ── DEMO PANEL BANNER (shows when not logged in) ─────────────────── */}
          {!isLoggedIn && !authLoading && activeTab === "dashboard" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8 flex flex-col items-start justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 px-6 py-5 sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground">Demo Panel</p>
                  <p className="text-sm text-muted-foreground">
                    Ini tampilan demo. Login untuk menggunakan fitur sesungguhnya.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => navigate("/auth")}>
                  Masuk
                </Button>
                <Button size="sm" onClick={() => navigate("/auth")}>
                  Daftar Gratis
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Meta Connection Card (DemoPanel style — compact) ───────────────── */}
          {activeTab === "dashboard" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 flex items-center justify-between rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Facebook className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">Meta Ecosystem</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {isMetaConnected ? "Token aktif ✅" : "Belum terhubung"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0 ml-2">
                {isMetaConnected ? (
                  <>
                    <Button variant="outline" size="sm" onClick={isLoggedIn ? connectToMeta : requireLogin} className="text-xs gap-1">
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={disconnectMeta} className="text-xs text-destructive gap-1">
                      <Unplug className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <Button variant="facebook" size="sm" className="gap-1.5 text-xs" onClick={isLoggedIn ? connectToMeta : requireLogin}>
                    <Facebook className="h-3.5 w-3.5" />
                    Connect
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Stats ─────────────────────────────────────────────────────────── */}
          {activeTab === "dashboard" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4"
            >
              {[
                { label: "Connected Pages", value: "2", icon: FileText, change: "+1 this week" },
                { label: "Messages Sent", value: "2,270", icon: MessageSquare, change: "+340 today" },
                { label: "Total Followers", value: "19.7K", icon: Users, change: "+2.1% growth" },
                { label: "Response Rate", value: "94%", icon: TrendingUp, change: "+3% this month" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/20"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-2 font-display text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="mt-1 text-xs text-success">{stat.change}</div>
                </div>
              ))}
            </motion.div>
          )}

          {/* ── Connected Pages List ──────────────────────────────────────────── */}
          {/* ── Pages Tab (Connection Management) ───────────────────────────── */}
          {activeTab === "pages" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-lg font-semibold text-foreground">Pengaturan Akun Meta</h2>
                </div>
              </div>

              <div className="space-y-4">
                {!isMetaConnected ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(214,89%,52%)]/10">
                      <Facebook className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-foreground">Belum Ada Akun Terhubung</h3>
                    <p className="mt-2 mb-6 max-w-sm text-sm text-muted-foreground">
                      Hubungkan akun Facebook dan Instagram Anda untuk mulai menggunakan fitur Autochat dan Auto-Posting.
                    </p>
                    <Button variant="facebook" onClick={isLoggedIn ? connectToMeta : requireLogin}>
                      <Facebook className="mr-2 h-4 w-4" />
                      Connect Facebook
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/20">
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                        <CheckCircle2 className="h-6 w-6 text-success" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground text-lg">Meta Ecosystem</span>
                          <div className="flex gap-1">
                            <Facebook className="h-4 w-4 text-[hsl(214,89%,52%)]" />
                            <Instagram className="h-4 w-4 text-pink-500" />
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-success"></span>
                            Status: Token Aktif
                          </span>
                          <span>·</span>
                          <span className="text-xs">
                            Mencakup akses Page & Instagram
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <Button
                        variant="outline"
                        className="gap-2 flex-1 md:flex-none"
                        onClick={connectToMeta}
                      >
                        <RefreshCw className="h-4 w-4" />
                        Perbarui Izin
                      </Button>
                      <Button
                        variant="destructive"
                        className="gap-2 flex-1 md:flex-none"
                        onClick={disconnectMeta}
                      >
                        <Unplug className="h-4 w-4" />
                        Putuskan (Disconnect)
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Audience Tab (Interaction Logs) ───────────────────────────── */}
          {activeTab === "audience" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-foreground">Log Interaksi Audience</h2>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => session?.user && fetchAudienceLogs(session.user.id)}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </Button>
              </div>

              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="grid grid-cols-12 gap-4 border-b border-border bg-secondary/30 px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <div className="col-span-3">Akun Instagram</div>
                  <div className="col-span-3">Status Follows</div>
                  <div className="col-span-3">Aktivitas</div>
                  <div className="col-span-3 text-right">Status Auto Chat</div>
                </div>

                <div className="divide-y divide-border">
                  {audienceLogs.length > 0 ? (
                    audienceLogs.map((log) => (
                      <div key={log.id} className="grid grid-cols-12 items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                        <div className="col-span-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                              {log.ig_username.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-foreground">@{log.ig_username}</span>
                          </div>
                        </div>
                        <div className="col-span-3">
                          {log.follow_status === 'follower' ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
                              <CheckCircle2 className="h-3 w-3" />
                              Follower
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                              <XCircle className="h-3 w-3" />
                              Non-Follower
                            </span>
                          )}
                        </div>
                        <div className="col-span-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground capitalize">
                              {log.interaction_type.replace('_', ' ')}
                            </span>
                            {log.interaction_text && (
                              <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                "{log.interaction_text}"
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="col-span-3 text-right">
                          {log.auto_chat_status === 'sent' ? (
                            <span className="inline-flex items-center gap-1.5 text-success text-sm font-medium">
                              <CheckCircle2 className="h-4 w-4" />
                              Terkirim
                            </span>
                          ) : log.auto_chat_status === 'failed' ? (
                            <span className="inline-flex items-center gap-1.5 text-destructive text-sm font-medium">
                              <XCircle className="h-4 w-4" />
                              Gagal
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-muted-foreground text-sm font-medium">
                              <RefreshCw className="h-4 w-4 animate-spin-slow" />
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center bg-card">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/5">
                        <Users className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-display text-lg font-semibold text-foreground">Belum Ada Interaksi</h3>
                      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                        Daftar akun Instagram yang berinteraksi (DM/Komentar) ke bot Anda akan muncul di sini.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Settings Tab (Account Management) ───────────────────────────── */}
          {activeTab === "settings" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold text-foreground">Pengaturan Akun</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Kelola informasi profil, email, dan keamanan password Anda.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm max-w-2xl">
                <form onSubmit={handleUpdateProfile} className="space-y-6">

                  {/* Profil Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b border-border pb-2">Profil Utama</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground" htmlFor="settings-name">Nama Tampilan</label>
                        <Input
                          id="settings-name"
                          placeholder="John Doe"
                          value={settingsName}
                          onChange={(e) => setSettingsName(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground" htmlFor="settings-phone">Nomor Telepon (WA)</label>
                        <Input
                          id="settings-phone"
                          placeholder="08123456789"
                          value={settingsPhone}
                          onChange={(e) => setSettingsPhone(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Keamanan Section */}
                  <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-semibold border-b border-border pb-2">Keamanan & Login</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground" htmlFor="settings-email">Alamat Email</label>
                        <Input
                          id="settings-email"
                          type="email"
                          placeholder="email@anda.com"
                          value={settingsEmail}
                          onChange={(e) => setSettingsEmail(e.target.value)}
                          className="w-full"
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">Jika Anda mengganti email, sistem akan mengirimkan link verifikasi ke inbox baru Anda.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground" htmlFor="settings-password">Password Baru</label>
                        <Input
                          id="settings-password"
                          type="password"
                          placeholder="Kosongkan jika tidak ingin ganti"
                          value={settingsPassword}
                          onChange={(e) => setSettingsPassword(e.target.value)}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Minimal 6 karakter. Isi hanya jika Anda ingin mengubah sandi saat ini.</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button type="submit" disabled={isUpdatingProfile} className="px-8 flex gap-2">
                      {isUpdatingProfile ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>Simpan Perubahan</>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* ── Analytics Tab (Empty State) ──────────────────────────────────── */}
          {activeTab === "analytics" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center bg-card">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">Fitur Belum Tersedia</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Laporan metrik interaksi, bounce rate, dan klik tombol akan dirilis segera.
              </p>
            </motion.div>
          )}

          {/* ── Auto-Replies (Triggers) / Automations Tab ─────────────────────── */}
          {activeTab === "automations" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-8"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-lg font-semibold text-foreground">Auto-Replies (Automations)</h2>
                </div>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={isLoggedIn ? () => { setEditingTrigger(null); setIsAddingTrigger(!isAddingTrigger); } : requireLogin}
                  variant={(isAddingTrigger || editingTrigger) ? "outline" : "hero"}
                >
                  {(isAddingTrigger || editingTrigger) ? <XCircle className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {(isAddingTrigger || editingTrigger) ? "Batal" : "Tambah Trigger"}
                </Button>
              </div>

              {/* ADD/EDIT TRIGGER WIZARD */}
              {(isAddingTrigger || editingTrigger) && session?.user && (
                <AutomationWizard
                  userId={session.user.id}
                  metaInstagramId={client?.meta_instagram_id}
                  metaAccessToken={client?.meta_access_token}
                  initialData={editingTrigger}
                  onSuccess={() => {
                    setIsAddingTrigger(false);
                    setEditingTrigger(null);
                    fetchTriggers(session.user.id);
                  }}
                  onCancel={() => { setIsAddingTrigger(false); setEditingTrigger(null); }}
                />
              )}

              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="grid grid-cols-12 gap-4 border-b border-border bg-secondary/30 px-6 py-3 text-xs font-semibold text-muted-foreground">
                  <div className="col-span-3">KEYWORD</div>
                  <div className="col-span-6">ISI BALASAN (DM & KOMEN)</div>
                  <div className="col-span-2">STATUS</div>
                  <div className="col-span-1 text-right">AKSI</div>
                </div>

                <div className="divide-y divide-border">
                  {triggers.length > 0 ? (
                    triggers.map((trigger) => (
                      <div key={trigger.id} className="grid grid-cols-12 gap-4 items-center px-6 py-4 transition-colors hover:bg-muted/50">
                        <div className="col-span-3 flex flex-col gap-1 items-start">
                          <span className="rounded-md bg-primary/10 px-2 py-1 text-sm font-medium text-primary">
                            "{trigger.keyword}"
                          </span>
                        </div>
                        <div className="col-span-6 flex flex-col gap-1">
                          {trigger.comment_reply && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <MessageSquare className="h-3 w-3" /> <span className="font-medium text-foreground/70">Komen:</span> {trigger.comment_reply}
                            </div>
                          )}
                          <p className="line-clamp-2 text-sm text-foreground">
                            <strong>Step 4:</strong> {trigger.step4_text || "(Tidak ada pesan DM)"}
                          </p>
                          {trigger.step4_button1_text && (
                            <div className="mt-1 flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="rounded bg-secondary px-1.5 py-0.5 whitespace-nowrap">{trigger.step4_button_type === 'web_url' ? 'URL' : 'Quick Reply'}: {trigger.step4_button1_text}</span>
                                {trigger.step4_button1_url && <span className="truncate max-w-[150px] text-primary">{trigger.step4_button1_url}</span>}
                              </div>
                              {trigger.step4_button2_text && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <span className="rounded bg-secondary px-1.5 py-0.5 whitespace-nowrap">{trigger.step4_button_type === 'web_url' ? 'URL' : 'Quick Reply'}: {trigger.step4_button2_text}</span>
                                  {trigger.step4_button2_url && <span className="truncate max-w-[150px] text-primary">{trigger.step4_button2_url}</span>}
                                </div>
                              )}
                            </div>
                          )}
                          {trigger.step5_text && (
                            <p className="line-clamp-2 text-sm text-foreground mt-1">
                              <strong>Step 5:</strong> {trigger.step5_text}
                            </p>
                          )}
                        </div>
                        <div className="col-span-2">
                          {trigger.is_active ? (
                            <span className="flex w-max items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                              <CheckCircle2 className="h-3 w-3" />
                              Active
                            </span>
                          ) : (
                            <span className="flex w-max items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                              <XCircle className="h-3 w-3" />
                              Inactive
                            </span>
                          )}
                        </div>
                        <div className="col-span-1 flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary" onClick={() => { setEditingTrigger(trigger); setIsAddingTrigger(false); }}>
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeleteTrigger(trigger.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-12 text-center">
                      <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                      <p className="text-sm font-medium text-foreground">Belum ada Automation</p>
                      <p className="text-xs text-muted-foreground mt-1 mb-4">Tambahkan keyword untuk membalas DM & Komen otomatis.</p>
                      {isLoggedIn && (
                        <Button size="sm" onClick={() => setIsAddingTrigger(true)}>Buat Automation Pertama</Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Paid upgrade nudge (only for free logged-in users) ─────────────── */}
          {isLoggedIn && !isPaid && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 px-6 py-4"
            >
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5 text-amber-500" />
                <p className="text-sm text-foreground">
                  Upgrade ke <strong>Paid</strong> untuk unlock unlimited pages & automations.
                </p>
              </div>
              <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10">
                Upgrade
              </Button>
            </motion.div>
          )}

        </div>
      </main>

      {/* Bottom Navigation — Mobile Only, exact DemoPanel pattern */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl">
        <div className="grid grid-cols-5 h-16" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          {bottomTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-0.5 transition-all ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-2xl transition-all ${isActive ? "bg-primary/10" : ""}`}>
                  <tab.icon className={`h-5 w-5 transition-all ${isActive ? "scale-110" : ""}`} />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;
