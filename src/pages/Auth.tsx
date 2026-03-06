import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, Mail, Lock, User, Phone, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "../contexts/LanguageContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

type AuthMode = "login" | "signup" | "forgot";

const AuthPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { t } = useLanguage();

    const [mode, setMode] = useState<AuthMode>("login");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [signupName, setSignupName] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPhone, setSignupPhone] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotSent, setForgotSent] = useState(false);

    // ── LOGIN ───────────────────────────────────────────────────────────────────
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const email = loginEmail.toLowerCase().trim();
            const { data, error } = await supabase.auth.signInWithPassword({ email, password: loginPassword });
            if (error) throw error;

            if (data.user) {
                const { error: upsertErr } = await supabase.from("autochat_clients").upsert({
                    user_id: data.user.id,
                    email: data.user.email,
                    display_name: data.user.email?.split("@")[0] || "User",
                    status: "free"
                }, { onConflict: "user_id", ignoreDuplicates: true });
                if (upsertErr) console.warn("Failed to seed client on login:", upsertErr);
            }

            toast({ title: t('auth.login.success') });
            navigate("/dashboard");
        } catch (err: any) {
            toast({ title: t('auth.login.failed'), description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    // ── SIGNUP ──────────────────────────────────────────────────────────────────
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const email = signupEmail.toLowerCase().trim();
            const { data, error } = await supabase.auth.signUp({
                email,
                password: signupPassword,
                options: { data: { display_name: signupName.trim(), phone_number: signupPhone.trim() || null } }
            });

            if (error) {
                if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('user already exists')) {
                    toast({ title: t('auth.register.already_exists_title'), description: t('auth.register.already_exists_desc') });
                    setLoginEmail(email);
                    setMode("login");
                    setLoading(false);
                    return;
                }
                throw error;
            }

            if (data.user) {
                const { error: upsertErr } = await supabase.from("autochat_clients").upsert({
                    user_id: data.user.id,
                    email,
                    display_name: signupName.trim() || email.split("@")[0],
                    phone_number: signupPhone.trim() || null,
                    status: "free"
                }, { onConflict: "user_id" });
                if (upsertErr) console.warn("Failed to seed client on signup:", upsertErr);
            }

            toast({ title: t('auth.register.success_title'), description: t('auth.register.success_desc') });
            navigate("/dashboard");
        } catch (err: any) {
            toast({ title: t('auth.register.failed'), description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    // ── FORGOT ──────────────────────────────────────────────────────────────────
    const handleForgot = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const email = forgotEmail.toLowerCase().trim();
            const { error } = await supabase.functions.invoke('send-reset-password-email', {
                body: {
                    email,
                    redirectTo: `${window.location.origin}/reset-password`
                }
            });
            if (error) throw error;
            setForgotSent(true);
            toast({ title: t('auth.forgot.email_sent_title'), description: t('auth.forgot.email_sent_desc') });
        } catch (err: any) {
            toast({ title: t('auth.forgot.failed_title'), description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
            </div>

            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4 z-10">
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 rounded-full border border-destructive/50 bg-destructive/90 hover:bg-destructive px-4 py-2 text-sm font-bold text-destructive-foreground shadow-sm backdrop-blur-md transition-colors cursor-pointer"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('nav.back')}</span>
                </button>
                <LanguageSwitcher />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 flex flex-1 flex-col justify-center px-5 py-20 sm:mx-auto sm:w-full sm:max-w-md"
            >
                {/* Logo */}
                <div className="mb-8 flex flex-col items-center gap-2">
                    <div className="h-24 w-24 overflow-hidden rounded-3xl bg-primary/10 ring-1 ring-primary/20 shadow-xl shadow-primary/10">
                        <img src="/autochat.png" alt="Autochat Logo" className="h-full w-full object-cover" />
                    </div>
                    <h1 className="font-display text-xl font-bold text-foreground">
                        Autochat <span className="text-gradient">El Vision</span>
                    </h1>
                    <p className="text-xs text-muted-foreground">Auto-reply Instagram &amp; Facebook</p>
                </div>

                <AnimatePresence mode="wait">
                    {/* ── FORGOT PASSWORD ── */}
                    {mode === "forgot" && (
                        <motion.div
                            key="forgot"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                        >
                            <button
                                onClick={() => { setMode("login"); setForgotSent(false); }}
                                className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" /> {t('auth.forgot.back_to_login')}
                            </button>
                            <h2 className="font-display text-2xl font-bold text-foreground">{t('auth.forgot.title')}</h2>
                            <p className="mt-1 text-sm text-muted-foreground">{t('auth.forgot.desc')}</p>

                            {forgotSent ? (
                                <div className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-5 text-center text-sm text-green-400">
                                    {t('auth.forgot.email_sent_message')}
                                </div>
                            ) : (
                                <form onSubmit={handleForgot} className="mt-6 space-y-4">
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input id="forgot-email" type="email" className="pl-11 h-12 rounded-xl text-base" placeholder={t('auth.login.email_placeholder')} value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
                                    </div>
                                    <Button type="submit" className="w-full h-12 text-base rounded-xl" disabled={loading}>
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('auth.forgot.send_link_btn')}
                                    </Button>
                                </form>
                            )}
                        </motion.div>
                    )}

                    {/* ── LOGIN / SIGNUP ── */}
                    {mode !== "forgot" && (
                        <motion.div
                            key="login-signup"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.25 }}
                        >
                            {/* Tabs */}
                            <div className="mb-6 flex rounded-xl border border-border bg-secondary/30 p-1">
                                {(["login", "signup"] as AuthMode[]).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setMode(tab)}
                                        className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${mode === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                        {tab === "login" ? t('auth.tab.login') : t('auth.tab.register')}
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {/* LOGIN FORM */}
                                {mode === "login" && (
                                    <motion.form key="login-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onSubmit={handleLogin} className="space-y-4">
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input id="login-email" type="email" className="pl-11 h-12 rounded-xl text-base" placeholder={t('auth.login.email_placeholder')} value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input id="login-password" type={showPassword ? "text" : "password"} className="pl-11 pr-12 h-12 rounded-xl text-base" placeholder={t('auth.login.password_placeholder')} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <div className="flex justify-end">
                                            <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:underline">
                                                {t('auth.login.forgot')}
                                            </button>
                                        </div>
                                        <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold" disabled={loading}>
                                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('auth.login.btn')}
                                        </Button>
                                    </motion.form>
                                )}

                                {/* SIGNUP FORM */}
                                {mode === "signup" && (
                                    <motion.form key="signup-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onSubmit={handleSignup} className="space-y-3">
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input id="signup-name" type="text" className="pl-11 h-12 rounded-xl text-base" placeholder={t('auth.register.name_placeholder')} value={signupName} onChange={(e) => setSignupName(e.target.value)} required />
                                        </div>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input id="signup-email" type="email" className="pl-11 h-12 rounded-xl text-base" placeholder={t('auth.login.email_placeholder')} value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                                        </div>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input id="signup-phone" type="tel" className="pl-11 h-12 rounded-xl text-base" placeholder={t('auth.register.phone_placeholder')} value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)} />
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input id="signup-password" type={showPassword ? "text" : "password"} className="pl-11 pr-12 h-12 rounded-xl text-base" placeholder={t('auth.register.password_placeholder')} value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} minLength={8} required />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold" disabled={loading}>
                                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('auth.register.btn')}
                                        </Button>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>

                <p className="mt-8 text-center text-xs text-muted-foreground">
                    {t('auth.powered')}
                </p>
            </motion.div>
        </div>
    );
};

export default AuthPage;
