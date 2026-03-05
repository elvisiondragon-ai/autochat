import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Zap, LayoutDashboard, FileText, Settings, LogOut, Facebook,
  CheckCircle2, XCircle, RefreshCw, Unplug, ChevronDown, MessageSquare,
  Instagram, MoreHorizontal, Users, TrendingUp, Crown, Loader2, Lock, Plus, Trash2, Sun, Moon, AlertTriangle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "../contexts/LanguageContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

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

interface AutochatTrigger {
  id: string;
  keyword: string;
  comment_reply?: string;
  reply_message: string;
  is_active: boolean;
  button_url?: string;
  button_text?: string;
  button_url_2?: string;
  button_text_2?: string;
}

interface AutochatClient {
  user_id?: string;
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

const DemoPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Simulated Demo Session & Client Data
  const [session, setSession] = useState<Session | null | undefined>({ user: { id: "demo-id", email: "demo@elvisiongroup.com" } } as any);
  const [client, setClient] = useState<AutochatClient | null>({
    user_id: "demo-id",
    display_name: "El Vision Store",
    email: "demo@elvisiongroup.com",
    status: "paid",
    meta_access_token: "demo-token",
    meta_instagram_id: "demo-ig",
    ig_profile_pic_url: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
  });

  // Dummy Data for full dashboard experience
  const [triggers, setTriggers] = useState<AutochatTrigger[]>([
    { id: "1", keyword: "Mau", reply_message: "Halo kak, ini link produknya ya 😊", is_active: true, button_text: "Beli Sekarang", button_url: "https://elvisiongroup.com" },
    { id: "2", keyword: "Harga", reply_message: "Harganya Rp 150.000 kak, lagi ada diskon 20% khusus hari ini!", is_active: true },
    { id: "3", keyword: "Promo", reply_message: "Promo bulan ini beli 2 gratis 1 ongkir seluruh Indonesia.", is_active: false },
    { id: "4", keyword: "Info", reply_message: "Info lengkap bisa cek di website resmi kami kak.", is_active: true },
    { id: "5", keyword: "Lokasi", reply_message: "Toko kami ada di Jakarta Selatan, kak.", is_active: true }
  ]);

  const [audienceLogs, setAudienceLogs] = useState<AutochatAudienceLog[]>([
    { id: "1", ig_username: "user_satu", follow_status: "following", interaction_type: "dm", auto_chat_status: "sent", interaction_text: "Harga", created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { id: "2", ig_username: "user_dua", follow_status: "unknown", interaction_type: "comment", auto_chat_status: "sent", interaction_text: "Mau", created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { id: "3", ig_username: "user_tiga", follow_status: "not_following", interaction_type: "dm", auto_chat_status: "sent", interaction_text: "Promo", created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { id: "4", ig_username: "user_empat", follow_status: "following", interaction_type: "story_reply", auto_chat_status: "sent", interaction_text: "Bagus", created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
    { id: "5", ig_username: "user_lima", follow_status: "following", interaction_type: "comment", auto_chat_status: "sent", interaction_text: "Info", created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() },
    { id: "6", ig_username: "user_enam", follow_status: "unknown", interaction_type: "dm", auto_chat_status: "failed", interaction_text: "Lokasi", created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    { id: "7", ig_username: "user_tujuh", follow_status: "following", interaction_type: "dm", auto_chat_status: "sent", interaction_text: "Harga", created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString() }
  ]);
  const [authLoading, setAuthLoading] = useState(false);

  // UI State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAddingTrigger, setIsAddingTrigger] = useState(false);
  const [newTrigger, setNewTrigger] = useState<Partial<AutochatTrigger>>({
    keyword: "",
    comment_reply: "",
    reply_message: "",
    button_text: "",
    button_url: "",
    button_text_2: "",
    button_url_2: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  // Settings State
  const [settingsName, setSettingsName] = useState("");
  const [settingsPhone, setSettingsPhone] = useState("");
  const [settingsEmail, setSettingsEmail] = useState("");
  const [settingsPassword, setSettingsPassword] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Meta Data State
  const [igProfilePic, setIgProfilePic] = useState<string | null>("https://i.pravatar.cc/150?u=a042581f4e29026704d");
  const [igFollowers, setIgFollowers] = useState<number>(12450);

  // Delete Account State
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Theme State
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Only theme setup, skip all DB and Auth calls for DemoPanel
    const savedTheme = localStorage.getItem("autochat-theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      document.documentElement.classList.add("dark");
    }
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
        // Required scopes for complete Instagram & FB publishing and analytics
        scope: 'pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement,pages_manage_posts,read_insights,instagram_basic,instagram_manage_messages,instagram_manage_comments,instagram_content_publish',
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

  const handleSaveTrigger = async () => {
    if (!session?.user) return requireLogin();
    if (!newTrigger.keyword || !newTrigger.reply_message) {
      toast({ title: "Validasi Gagal", description: "Keyword dan Isi Balasan DM wajib diisi.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        user_id: session.user.id,
        keyword: newTrigger.keyword,
        comment_reply: newTrigger.comment_reply || null,
        reply_message: newTrigger.reply_message,
        button_text: newTrigger.button_text || null,
        button_url: newTrigger.button_url || null,
        button_text_2: newTrigger.button_text_2 || null,
        button_url_2: newTrigger.button_url_2 || null,
        is_active: true
      };

      const { error } = await supabase.from("autochat_triggers").insert(payload);
      if (error) throw error;

      toast({ title: "Trigger Berhasil Disimpan", description: `Keyword "${newTrigger.keyword}" aktif.` });
      setNewTrigger({ keyword: "", comment_reply: "", reply_message: "", button_text: "", button_url: "", button_text_2: "", button_url_2: "" });
      setIsAddingTrigger(false);
      fetchTriggers(session.user.id);

    } catch (err: any) {
      toast({ title: "Gagal menyimpan trigger", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
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

  const handleDeleteAccount = async () => {
    if (deleteAccountConfirm !== "Delete My Account" || !session?.user?.id) return;
    setIsDeletingAccount(true);
    try {
      // Attempt local deletion from custom table
      const { error: dbError } = await supabase.from('autochat_clients').delete().eq('user_id', session.user.id);
      if (dbError) console.warn("Could not delete from DB", dbError);

      await supabase.auth.signOut();
      toast({
        title: "Akun Telah Dihapus",
        description: "Data Anda telah dihapus dan sesi diakhiri secara permanen.",
        variant: "destructive",
      });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Gagal menghapus", description: err.message, variant: "destructive" });
      setIsDeletingAccount(false);
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

  // Calculated Real Stats
  const activeTriggersCount = triggers.filter(t => t.is_active).length;
  const messagesSentCount = audienceLogs.filter(l => l.auto_chat_status === 'sent').length;
  const totalAudiencesCount = audienceLogs.length;
  const responseRate = totalAudiencesCount > 0
    ? Math.round((messagesSentCount / totalAudiencesCount) * 100) + "%"
    : "0%";

  // Called on protected action buttons
  const requireLogin = () => {
    toast({
      title: "Login diperlukan",
      description: "Silahkan masuk untuk menggunakan fitur ini.",
    });
    navigate("/auth");
  };

  // Analytics Stats Calculation
  const commentsTotal = audienceLogs.filter(l => l.interaction_type === 'comment').length;
  const commentsSent = audienceLogs.filter(l => l.interaction_type === 'comment' && l.auto_chat_status === 'sent').length;

  const storyRepliesTotal = audienceLogs.filter(l => l.interaction_type === 'story_reply').length;
  const storyRepliesSent = audienceLogs.filter(l => l.interaction_type === 'story_reply' && l.auto_chat_status === 'sent').length;

  const dmsTotal = audienceLogs.filter(l => l.interaction_type === 'dm').length;
  const dmsSent = audienceLogs.filter(l => l.interaction_type === 'dm' && l.auto_chat_status === 'sent').length;

  const storyMentionsTotal = audienceLogs.filter(l => l.interaction_type === 'story_mention').length;
  const storyMentionsSent = audienceLogs.filter(l => l.interaction_type === 'story_mention' && l.auto_chat_status === 'sent').length;

  const bottomTabs = [
    { id: "dashboard", icon: LayoutDashboard, label: "Home" },
    { id: "automations", icon: MessageSquare, label: "Bot" },
    { id: "analytics", icon: TrendingUp, label: "Analitik" },
    { id: "audience", icon: Users, label: "Audience" },
    { id: "settings", icon: Settings, label: "Profil" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ── Mobile Header ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <img src="/autochat.png" alt="Autochat" className="h-6 w-6 object-contain" />
          <span className="font-display text-base font-bold text-foreground">
            Autochat <span className="text-gradient">El Vision</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          {/* IG Profile avatar */}
          <div
            className="h-8 w-8 rounded-full overflow-hidden border-2 border-border bg-secondary flex items-center justify-center text-xs font-bold text-foreground cursor-pointer"
            onClick={() => setActiveTab("settings")}
          >
            {authLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : igProfilePic ? (
              <img src={igProfilePic} alt="IG Profile" className="h-full w-full object-cover" />
            ) : (
              initials.slice(0, 1)
            )}
          </div>
        </div>
      </header>

      {/* ── Page Content ────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="px-4 py-5 max-w-2xl mx-auto">



          {/* ── HOME TAB ──────────────────────────────────────────── */}
          {activeTab === "dashboard" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-4">

              {/* IG Profile Hero Card */}
              {isLoggedIn && (
                <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
                  <div className="h-16 w-16 shrink-0 rounded-full overflow-hidden border-2 border-primary/30 bg-secondary flex items-center justify-center text-xl font-bold text-foreground">
                    {igProfilePic ? (
                      <img src={igProfilePic} alt="IG" className="h-full w-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{displayName}</p>
                    {igFollowers > 0 && (
                      <p className="text-sm text-muted-foreground">{igFollowers.toLocaleString()} followers</p>
                    )}
                    <div className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${isMetaConnected ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${isMetaConnected ? "bg-green-500" : "bg-muted-foreground"}`} />
                      {isMetaConnected ? "Meta Terhubung" : "Belum Terhubung"}
                    </div>
                  </div>
                  {!isMetaConnected && (
                    <Button size="sm" variant="facebook" className="shrink-0 text-xs gap-1.5" onClick={isLoggedIn ? connectToMeta : requireLogin}>
                      <Facebook className="h-3.5 w-3.5" /> Connect
                    </Button>
                  )}
                </div>
              )}

              {/* Stats — horizontal scroll on mobile */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: t('dashboard.stat.triggers'), value: activeTriggersCount.toString(), icon: Zap, sub: `${triggers.length} total rules` },
                  { label: t('dashboard.stat.messages'), value: messagesSentCount.toString(), icon: MessageSquare, sub: "Auto-replies sent" },
                  { label: t('dashboard.stat.audiences'), value: totalAudiencesCount.toString(), icon: Users, sub: "Interactions" },
                  { label: t('dashboard.stat.response'), value: responseRate, icon: TrendingUp, sub: "Success rate" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{stat.label}</span>
                      <stat.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="font-display text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="mt-1 text-[10px] text-success">{stat.sub}</div>
                  </div>
                ))}
              </div>

              {/* Facebook Connection Card — compact */}
              {isMetaConnected && (
                <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Facebook className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Meta Ecosystem</p>
                      <p className="text-xs text-muted-foreground">Token aktif</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={connectToMeta} className="text-xs gap-1">
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={disconnectMeta} className="text-xs text-destructive gap-1">
                      <Unplug className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Automations preview — shortcuts to Bot tab */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h2 className="font-semibold text-sm text-foreground">Automation aktif</h2>
                  <Button size="sm" variant="ghost" className="text-xs text-primary" onClick={() => setActiveTab("automations")}>Lihat Semua</Button>
                </div>
                {triggers.length > 0 ? (
                  <div className="divide-y divide-border">
                    {triggers.slice(0, 3).map((trigger) => (
                      <div key={trigger.id} className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <MessageSquare className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">"{trigger.keyword}"</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[180px]">{trigger.reply_message}</p>
                          </div>
                        </div>
                        <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${trigger.is_active ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}>
                          {trigger.is_active ? "Aktif" : "Off"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center px-4">
                    <p className="text-sm text-muted-foreground">Belum ada automation</p>
                    <Button size="sm" className="mt-3 gap-2" onClick={() => { setActiveTab("automations"); setIsAddingTrigger(true); }}>
                      <Plus className="h-3.5 w-3.5" /> Buat Automation
                    </Button>
                  </div>
                )}
              </div>

              {/* Upgrade nudge */}
              {isLoggedIn && !isPaid && (
                <div className="flex items-center justify-between rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500 shrink-0" />
                    <p className="text-xs text-foreground">Upgrade ke <strong>Paid</strong> untuk unlimited automations</p>
                  </div>
                  <Button size="sm" variant="outline" className="shrink-0 border-amber-500/30 text-amber-500 hover:bg-amber-500/10 text-xs">Upgrade</Button>
                </div>
              )}

            </motion.div>
          )}

          {/* ── AUTOMATIONS TAB ───────────────────────────────────── */}
          {activeTab === "automations" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-foreground">Automations</h2>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={isLoggedIn ? () => setIsAddingTrigger(!isAddingTrigger) : requireLogin}
                  variant={isAddingTrigger ? "outline" : "hero"}
                >
                  {isAddingTrigger ? <XCircle className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {isAddingTrigger ? "Batal" : "Tambah"}
                </Button>
              </div>

              {isAddingTrigger && session?.user && (
                <AutomationWizard
                  userId={session.user.id}
                  metaInstagramId={client?.meta_instagram_id || null}
                  metaAccessToken={client?.meta_access_token || null}
                  onSuccess={() => { setIsAddingTrigger(false); fetchTriggers(session.user.id); }}
                  onCancel={() => setIsAddingTrigger(false)}
                />
              )}

              {/* Trigger list — mobile cards */}
              <div className="space-y-3">
                {triggers.length > 0 ? (
                  triggers.map((trigger) => (
                    <div key={trigger.id} className="rounded-2xl border border-border bg-card p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary">"{trigger.keyword}"</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${trigger.is_active ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}>
                            {trigger.is_active ? "Aktif" : "Off"}
                          </span>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteTrigger(trigger.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      {trigger.comment_reply && (
                        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                          Komen: {trigger.comment_reply}
                        </p>
                      )}
                      {/* DM reply preview — Instagram bubble style */}
                      <div className="mt-1 rounded-2xl rounded-tl-sm bg-muted/60 p-3 space-y-2">
                        <p className="text-sm text-foreground leading-relaxed">{trigger.reply_message}</p>
                        {trigger.button_url && (
                          <div className="flex flex-col gap-1.5 pt-1 border-t border-border/50">
                            <a
                              href={trigger.button_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                            >
                              {trigger.button_text || "Link"}
                            </a>
                            {trigger.button_url_2 && (
                              <a
                                href={trigger.button_url_2}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                              >
                                {trigger.button_text_2 || "Link 2"}
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  ))
                ) : (
                  <div className="py-16 text-center rounded-2xl border border-dashed border-border bg-card">
                    <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                    <p className="text-sm font-medium text-foreground">Belum ada Automation</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">Tambahkan keyword untuk auto-reply DM & Komentar.</p>
                    {isLoggedIn && (
                      <Button size="sm" onClick={() => setIsAddingTrigger(true)}>Buat Automation Pertama</Button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── ANALYTICS TAB ─────────────────────────────────────── */}
          {activeTab === "analytics" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-4">
              <h2 className="font-display text-lg font-bold text-foreground">Analytics</h2>

              {/* Follower growth card */}
              {igFollowers > 0 ? (
                <div className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    {igProfilePic ? (
                      <img src={igProfilePic} alt="IG" className="h-10 w-10 rounded-full object-cover border border-border" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Instagram className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">Instagram Followers</p>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-3xl font-bold text-foreground">{igFollowers.toLocaleString()}</span>
                        <span className="text-xs text-green-500 flex items-center gap-0.5"><TrendingUp className="h-3 w-3" /> Aktif</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-center">
                  <Instagram className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Hubungkan Instagram untuk melihat data followers</p>
                </div>
              )}

              {/* Interaction metrics */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Comments", sent: commentsSent, total: commentsTotal, icon: MessageSquare },
                  { label: "Story Replies", sent: storyRepliesSent, total: storyRepliesTotal, icon: Instagram },
                  { label: "DMs", sent: dmsSent, total: dmsTotal, icon: MessageSquare },
                  { label: "Story Mentions", sent: storyMentionsSent, total: storyMentionsTotal, icon: Instagram },
                ].map((m) => (
                  <div key={m.label} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">{m.label}</span>
                      <m.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="font-display text-2xl font-bold text-foreground">{m.sent}</div>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: m.total > 0 ? `${Math.min(100, (m.sent / m.total) * 100)}%` : "0%" }}
                      />
                    </div>
                    <div className="mt-1 text-[10px] text-muted-foreground">Out of <span className="font-semibold text-foreground">{m.total}</span></div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 text-center">
                <p className="text-sm text-muted-foreground">📊 Gathering your activity. Please check back tomorrow!</p>
              </div>
            </motion.div>
          )}

          {/* ── AUDIENCE TAB ──────────────────────────────────────── */}
          {activeTab === "audience" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-foreground">Audience</h2>
                <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={() => session?.user && fetchAudienceLogs(session.user.id)}>
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </Button>
              </div>

              {audienceLogs.length > 0 ? (
                <div className="space-y-3">
                  {audienceLogs.map((log) => (
                    <div key={log.id} className="rounded-2xl border border-border bg-card p-4 space-y-2">
                      {/* Header: avatar + username */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                            {log.ig_username.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-foreground text-sm">@{log.ig_username}</span>
                        </div>
                        {/* Auto-chat status */}
                        {log.auto_chat_status === 'sent' ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-500 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Terkirim
                          </span>
                        ) : log.auto_chat_status === 'failed' ? (
                          <span className="inline-flex items-center gap-1 text-xs text-destructive font-medium">
                            <XCircle className="h-3.5 w-3.5" /> Gagal
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
                            <RefreshCw className="h-3 w-3" /> Pending
                          </span>
                        )}
                      </div>

                      {/* Row 2: follow status + activity */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {log.follow_status === 'follower' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
                            <CheckCircle2 className="h-3 w-3" /> Follower
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            <XCircle className="h-3 w-3" /> Non-Follower
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground capitalize">{log.interaction_type.replace('_', ' ')}</span>
                      </div>

                      {log.interaction_text && (
                        <p className="text-xs text-muted-foreground truncate">"{log.interaction_text}"</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/5">
                    <Users className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm">Belum Ada Interaksi</h3>
                  <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                    Akun Instagram yang DM / komentar ke bot Anda akan muncul di sini.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── SETTINGS TAB ──────────────────────────────────────── */}

          {activeTab === "settings" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-4">
              {/* Profile header */}
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-primary/20 bg-secondary flex items-center justify-center text-2xl font-bold text-foreground">
                  {igProfilePic ? (
                    <img src={igProfilePic} alt="IG Profile" className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="text-center">
                  <p className="font-bold text-foreground">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                  {igFollowers > 0 && <p className="text-xs text-primary mt-0.5">{igFollowers.toLocaleString()} followers IG</p>}
                </div>
              </div>

              {/* Meta connection */}
              <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <h3 className="font-semibold text-sm text-foreground">Koneksi Meta</h3>
                {!isMetaConnected ? (
                  <Button variant="facebook" className="w-full gap-2" onClick={isLoggedIn ? connectToMeta : requireLogin}>
                    <Facebook className="h-4 w-4" /> Connect Facebook & Instagram
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-green-500">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      Meta Ecosystem terhubung — token aktif
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 gap-2 text-sm" onClick={connectToMeta}>
                        <RefreshCw className="h-3.5 w-3.5" /> Perbarui
                      </Button>
                      <Button variant="destructive" className="flex-1 gap-2 text-sm" onClick={disconnectMeta}>
                        <Unplug className="h-3.5 w-3.5" /> Putuskan
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile form */}
              {isLoggedIn && (
                <div className="rounded-2xl border border-border bg-card p-4">
                  <h3 className="font-semibold text-sm text-foreground mb-4">{t('settings.profile')}</h3>
                  <form onSubmit={handleUpdateProfile} className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">{t('settings.name')}</label>
                      <Input id="settings-name" placeholder="John Doe" value={settingsName} onChange={(e) => setSettingsName(e.target.value)} className="h-11 rounded-xl" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">{t('settings.phone')}</label>
                      <Input id="settings-phone" placeholder="08123456789" value={settingsPhone} onChange={(e) => setSettingsPhone(e.target.value)} className="h-11 rounded-xl" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">{t('settings.email')}</label>
                      <Input id="settings-email" type="email" value={settingsEmail} onChange={(e) => setSettingsEmail(e.target.value)} className="h-11 rounded-xl" required />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">{t('settings.password')} <span className="text-muted-foreground/60">(kosongkan jika tidak ganti)</span></label>
                      <Input id="settings-password" type="password" value={settingsPassword} onChange={(e) => setSettingsPassword(e.target.value)} className="h-11 rounded-xl" />
                    </div>
                    <Button type="submit" disabled={isUpdatingProfile} className="w-full h-11 rounded-xl">
                      {isUpdatingProfile ? <><RefreshCw className="h-4 w-4 animate-spin mr-2" />{t('common.saving')}</> : t('common.save')}
                    </Button>
                  </form>
                </div>
              )}

              {/* Logout / Login button */}
              <div>
                {isLoggedIn ? (
                  <Button variant="outline" className="w-full gap-2 rounded-xl h-11 border-destructive/30 text-destructive hover:bg-destructive/5" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" /> {t('nav.logout')}
                  </Button>
                ) : (
                  <Button className="w-full gap-2 rounded-xl h-11" onClick={() => navigate("/auth")}>
                    <Lock className="h-4 w-4" /> {t('nav.login')}
                  </Button>
                )}
              </div>

              {/* Danger Zone */}
              {isLoggedIn && (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <h3 className="font-semibold text-sm text-destructive">{t('settings.danger')}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{t('settings.danger.desc')}</p>
                  <Input
                    placeholder='Ketik "Delete My Account"'
                    value={deleteAccountConfirm}
                    onChange={(e) => setDeleteAccountConfirm(e.target.value)}
                    className="h-11 rounded-xl border-destructive/30"
                  />
                  <Button
                    variant="destructive"
                    className="w-full h-11 rounded-xl"
                    disabled={deleteAccountConfirm !== "Delete My Account" || isDeletingAccount}
                    onClick={handleDeleteAccount}
                  >
                    {isDeletingAccount ? "..." : t('settings.danger.btn')}
                  </Button>
                </div>
              )}
            </motion.div>
          )}

        </div>
      </main>

      {/* ── Bottom Tab Navigation ────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl">
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

export default DemoPanel;

