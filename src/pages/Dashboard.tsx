import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Zap, LayoutDashboard, FileText, Settings, LogOut, Facebook,
  CheckCircle2, XCircle, RefreshCw, Unplug, ChevronDown, MessageSquare,
  Instagram, MoreHorizontal, Users, TrendingUp, Crown, Loader2, Lock, Plus, Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

// ── Mock demo data (always shown so visitors can feel the dashboard) ──────────
const mockPages = [
  { id: "1", name: "El Vision Store", category: "E-Commerce", isActive: true, hasInstagram: true, followers: "12.4K", messagesThisMonth: 1847 },
  { id: "2", name: "El Vision Blog", category: "Media/News", isActive: true, hasInstagram: false, followers: "5.2K", messagesThisMonth: 423 },
  { id: "3", name: "El Vision Support", category: "Business", isActive: false, hasInstagram: true, followers: "2.1K", messagesThisMonth: 0 },
];

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: FileText, label: "Pages", active: false },
  { icon: MessageSquare, label: "Automations", active: false },
  { icon: Users, label: "Audience", active: false },
  { icon: TrendingUp, label: "Analytics", active: false },
  { icon: Settings, label: "Settings", active: false },
];

interface AutochatTrigger {
  id: string;
  keyword: string;
  reply_message: string;
  is_active: boolean;
  button_url?: string;
  button_text?: string;
}

interface AutochatClient {
  display_name?: string;
  email?: string;
  status?: "free" | "paid";
  meta_access_token?: string | null;
  meta_page_id?: string | null;
  meta_instagram_id?: string | null;
}

// Ensure FB SDK is typed on window
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [client, setClient] = useState<AutochatClient | null>(null);
  const [triggers, setTriggers] = useState<AutochatTrigger[]>([]);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
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

          const { data: tData } = await supabase
            .from("ig_triggers")
            .select("*")
            .order("created_at", { ascending: false });
          if (tData) setTriggers(tData);
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
              const accessToken = response.authResponse.accessToken;
              console.log("[AutoChat] Saving accessToken to supabase...");
              const { error } = await supabase
                .from("autochat_clients")
                .update({ meta_access_token: accessToken })
                .eq("user_id", session?.user.id);

              if (error) throw error;

              console.log("[AutoChat] Token saved successfully in DB");
              setClient(prev => prev ? { ...prev, meta_access_token: accessToken } : null);
              toast({ title: "Sukses tersambung ke Facebook", description: "Meta Token berhasil disimpan." });
            } catch (err: any) {
              console.error("[AutoChat] Token save error:", err);
              toast({ title: "Gagal menyimpan token", description: err.message, variant: "destructive" });
            }
          };
          saveToken();

        } else {
          console.warn("[AutoChat] User cancelled login or did not fully authorize. Response:", response);
          toast({ title: "Login Facebook dibatalkan", description: "Anda menutup pop-up atau tidak memberikan izin.", variant: "destructive" });
        }
      }, {
        // Required scopes for Instagram messaging and Graph API reading
        scope: 'pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement,instagram_basic,instagram_manage_messages,instagram_manage_comments',
        return_scopes: true
      });
    } catch (err) {
      console.error("[AutoChat] Error calling FB.login:", err);
      toast({ title: "Error memuat Pop-Up", description: "Browser Anda memblokir script Meta.", variant: "destructive" });
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

  const isLoggedIn = !!session;
  const isPaid = client?.status === "paid";
  const isMetaConnected = !!client?.meta_access_token;
  const displayName = client?.display_name ?? session?.user?.email?.split("@")[0] ?? "Demo User";
  const initials = displayName.slice(0, 2).toUpperCase();

  // Called on protected action buttons
  const requireLogin = () => {
    toast({
      title: "Login diperlukan",
      description: "Silahkan masuk untuk menggunakan fitur ini.",
    });
    navigate("/auth");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-border bg-card">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold text-foreground">
            Autochat <span className="text-gradient">El Vision</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${item.active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
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

      {/* Main Content */}
      <main className="ml-64 flex-1">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-8 backdrop-blur-xl">
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
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground">
              {authLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : initials.slice(0, 1)}
            </div>
          </div>
        </header>

        <div className="p-8">

          {/* ── DEMO PANEL BANNER (shows when not logged in) ─────────────────── */}
          {!isLoggedIn && !authLoading && (
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

          {/* ── Facebook Connection Card ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(214,89%,52%)]/10">
                  <Facebook className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">Facebook Connection</h3>
                  <p className="text-sm text-muted-foreground">
                    {isMetaConnected
                      ? "Akun berhasil terhubung dengan Meta."
                      : "Connect your Facebook Page to start automating messages."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isMetaConnected ? (
                  <>
                    <Button variant="outline" size="sm" className="gap-2" onClick={connectToMeta}>
                      <RefreshCw className="h-3.5 w-3.5" />
                      Refresh Token
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:text-destructive" onClick={disconnectMeta}>
                      <Unplug className="h-3.5 w-3.5" />
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button variant="facebook" size="sm" className="gap-2" onClick={isLoggedIn ? connectToMeta : requireLogin}>
                    <Facebook className="h-4 w-4" />
                    Connect Facebook
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* ── Stats ─────────────────────────────────────────────────────────── */}
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

          {/* ── Connected Pages List ──────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-lg font-semibold text-foreground">Connected Pages</h2>
                {!isLoggedIn && (
                  <span className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
                    Demo
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={isLoggedIn ? undefined : requireLogin}
              >
                <Facebook className="h-3.5 w-3.5" />
                Add Page
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-3">
              {mockPages.map((page, i) => (
                <motion.div
                  key={page.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary font-display text-sm font-bold text-foreground">
                      {page.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{page.name}</span>
                        {page.hasInstagram && (
                          <Instagram className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{page.category}</span>
                        <span>·</span>
                        <span>{page.followers} followers</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">
                        {page.messagesThisMonth.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">messages/mo</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {page.isActive ? (
                        <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                          <XCircle className="h-3 w-3" />
                          Inactive
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={isLoggedIn ? undefined : requireLogin}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          {/* ── Auto-Replies (Triggers) List ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-lg font-semibold text-foreground">Auto-Replies (Triggers)</h2>
              </div>
              <Button
                size="sm"
                className="gap-2"
                onClick={isLoggedIn ? () => toast({ description: "Fitur tambah trigger segera hadir di UI ini!" }) : requireLogin}
              >
                <Plus className="h-4 w-4" />
                Tambah Trigger
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="grid grid-cols-12 gap-4 border-b border-border bg-secondary/30 px-6 py-3 text-xs font-semibold text-muted-foreground">
                <div className="col-span-3">KEYWORD (JIKA KOMEN INI)</div>
                <div className="col-span-6">ISI BALASAN DM</div>
                <div className="col-span-2">STATUS</div>
                <div className="col-span-1 text-right">AKSI</div>
              </div>

              <div className="divide-y divide-border">
                {triggers.length > 0 ? (
                  triggers.map((trigger) => (
                    <div key={trigger.id} className="grid grid-cols-12 gap-4 items-center px-6 py-4 transition-colors hover:bg-muted/50">
                      <div className="col-span-3">
                        <span className="rounded-md bg-primary/10 px-2 py-1 text-sm font-medium text-primary">
                          "{trigger.keyword}"
                        </span>
                      </div>
                      <div className="col-span-6">
                        <p className="line-clamp-2 text-sm text-foreground">{trigger.reply_message}</p>
                        {trigger.button_url && (
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="rounded bg-secondary px-1.5 py-0.5">Tombol</span>
                            <span className="truncate max-w-[200px]">{trigger.button_text}</span>
                          </div>
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
                      <div className="col-span-1 flex justify-end">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center">
                    <MessageSquare className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm font-medium text-foreground">Belum ada trigger</p>
                    <p className="text-xs text-muted-foreground mt-1">Tambahkan keyword untuk membalas DM otomatis.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

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
    </div>
  );
};

export default Dashboard;
