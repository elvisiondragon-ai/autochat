import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, Mail, Lock, User, Phone, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

type AuthMode = "login" | "signup" | "forgot";

const AuthPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [mode, setMode] = useState<AuthMode>("login");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Login fields
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // Signup fields
    const [signupName, setSignupName] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPhone, setSignupPhone] = useState("");
    const [signupPassword, setSignupPassword] = useState("");

    // Forgot password
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotSent, setForgotSent] = useState(false);

    // ── LOGIN ──────────────────────────────────────────────────────────────────
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const email = loginEmail.toLowerCase().trim();
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password: loginPassword,
            });
            if (error) throw error;

            // Seed autochat_clients if first login from ecosystem
            if (data.user) {
                const { error: upsertErr } = await supabase.from("autochat_clients").upsert({
                    user_id: data.user.id,
                    email: data.user.email,
                    display_name: data.user.email?.split("@")[0] || "User",
                    status: "free"
                }, { onConflict: "user_id", ignoreDuplicates: true });
                if (upsertErr) console.warn("Failed to seed client on login:", upsertErr);
            }

            toast({ title: "Selamat datang! 🎉" });
            navigate("/dashboard");
        } catch (err: any) {
            toast({
                title: "Login gagal",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // ── SIGNUP ─────────────────────────────────────────────────────────────────
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const email = signupEmail.toLowerCase().trim();

            const { data, error } = await supabase.auth.signUp({
                email,
                password: signupPassword,
                options: {
                    data: {
                        display_name: signupName.trim(),
                        phone_number: signupPhone.trim() || null
                    }
                }
            });

            if (error) {
                if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('user already exists')) {
                    toast({
                        title: "Akun sudah ada di ecosystem, login otomatis",
                        description: "Silahkan masuk dengan password Anda",
                    });
                    setLoginEmail(email);
                    setMode("login");
                    setLoading(false);
                    return;
                }
                throw error;
            }

            if (data.user) {
                // Seed autochat_clients directly
                const { error: upsertErr } = await supabase.from("autochat_clients").upsert({
                    user_id: data.user.id,
                    email: email,
                    display_name: signupName.trim() || email.split("@")[0],
                    phone_number: signupPhone.trim() || null,
                    status: "free"
                }, { onConflict: "user_id" });
                if (upsertErr) console.warn("Failed to seed client on signup:", upsertErr);
            }

            toast({ title: "Akun berhasil dibuat! 🚀", description: "Selamat datang di Autochat El Vision" });
            navigate("/dashboard");
        } catch (err: any) {
            toast({
                title: "Signup gagal",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // ── FORGOT PASSWORD ────────────────────────────────────────────────────────
    const handleForgot = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const email = forgotEmail.toLowerCase().trim();
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth?mode=reset`
            });

            if (error) throw error;

            setForgotSent(true);
            toast({ title: "Email reset dikirim!", description: "Cek inbox / spam Anda" });
        } catch (err: any) {
            toast({
                title: "Gagal kirim email",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
            {/* Background glows */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
                <div className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-primary/5 blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Logo */}
                <div className="mb-8 flex items-center justify-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center">
                        <img src="/autochat.png" alt="Autochat Logo" className="h-7 w-7 object-contain drop-shadow-md" />
                    </div>
                    <span className="font-display text-xl font-bold text-foreground">
                        Autochat <span className="text-gradient">El Vision</span>
                    </span>
                </div>
                {/* Card */}
                <div className="rounded-2xl border border-border bg-card p-8 shadow-xl shadow-black/10">

                    {/* ── FORGOT PASSWORD ── */}
                    <AnimatePresence mode="wait">
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
                                    className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <ArrowLeft className="h-4 w-4" /> Kembali ke Login
                                </button>
                                <h2 className="font-display text-2xl font-bold text-foreground">Lupa Password</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Masukkan email Anda, kami kirimkan link reset password.
                                </p>

                                {forgotSent ? (
                                    <div className="mt-6 rounded-xl border border-success/30 bg-success/10 p-4 text-center text-sm text-success">
                                        Email reset telah dikirim! Cek inbox / spam Anda.
                                    </div>
                                ) : (
                                    <form onSubmit={handleForgot} className="mt-6 space-y-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="forgot-email">Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="forgot-email"
                                                    type="email"
                                                    className="pl-9"
                                                    placeholder="email@domain.com"
                                                    value={forgotEmail}
                                                    onChange={(e) => setForgotEmail(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <Button type="submit" className="w-full" disabled={loading}>
                                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Kirim Link Reset"}
                                        </Button>
                                    </form>
                                )}
                            </motion.div>
                        )}

                        {/* ── LOGIN / SIGNUP TABS ── */}
                        {mode !== "forgot" && (
                            <motion.div
                                key="login-signup"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.25 }}
                            >
                                {/* Tabs */}
                                <div className="mb-6 flex rounded-lg border border-border bg-secondary/30 p-1">
                                    {(["login", "signup"] as AuthMode[]).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setMode(tab)}
                                            className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${mode === tab
                                                ? "bg-card text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                                }`}
                                        >
                                            {tab === "login" ? "Masuk" : "Daftar"}
                                        </button>
                                    ))}
                                </div>

                                {/* ── LOGIN FORM ── */}
                                <AnimatePresence mode="wait">
                                    {mode === "login" && (
                                        <motion.form
                                            key="login-form"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            onSubmit={handleLogin}
                                            className="space-y-4"
                                        >
                                            <div className="space-y-1.5">
                                                <Label htmlFor="login-email">Email</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        id="login-email"
                                                        type="email"
                                                        className="pl-9"
                                                        placeholder="email@domain.com"
                                                        value={loginEmail}
                                                        onChange={(e) => setLoginEmail(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="login-password">Password</Label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        id="login-password"
                                                        type={showPassword ? "text" : "password"}
                                                        className="pl-9 pr-10"
                                                        placeholder="Password"
                                                        value={loginPassword}
                                                        onChange={(e) => setLoginPassword(e.target.value)}
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                    >
                                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => setMode("forgot")}
                                                    className="text-xs text-primary hover:underline"
                                                >
                                                    Lupa Password?
                                                </button>
                                            </div>

                                            <Button type="submit" className="w-full" disabled={loading}>
                                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Masuk"}
                                            </Button>
                                        </motion.form>
                                    )}

                                    {/* ── SIGNUP FORM ── */}
                                    {mode === "signup" && (
                                        <motion.form
                                            key="signup-form"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            onSubmit={handleSignup}
                                            className="space-y-4"
                                        >
                                            <div className="space-y-1.5">
                                                <Label htmlFor="signup-name">Nama Lengkap</Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        id="signup-name"
                                                        type="text"
                                                        className="pl-9"
                                                        placeholder="Nama Anda"
                                                        value={signupName}
                                                        onChange={(e) => setSignupName(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="signup-email">Email</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        id="signup-email"
                                                        type="email"
                                                        className="pl-9"
                                                        placeholder="email@domain.com"
                                                        value={signupEmail}
                                                        onChange={(e) => setSignupEmail(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="signup-phone">
                                                    No. HP <span className="text-muted-foreground text-xs">(opsional)</span>
                                                </Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        id="signup-phone"
                                                        type="tel"
                                                        className="pl-9"
                                                        placeholder="+62 8xx-xxxx-xxxx"
                                                        value={signupPhone}
                                                        onChange={(e) => setSignupPhone(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="signup-password">Password</Label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        id="signup-password"
                                                        type={showPassword ? "text" : "password"}
                                                        className="pl-9 pr-10"
                                                        placeholder="Min. 8 karakter"
                                                        value={signupPassword}
                                                        onChange={(e) => setSignupPassword(e.target.value)}
                                                        minLength={8}
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                    >
                                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <Button type="submit" className="w-full" disabled={loading}>
                                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buat Akun"}
                                            </Button>
                                        </motion.form>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                    Powered by El Vision Ecosystem
                </p>
            </motion.div >
        </div >
    );
};

export default AuthPage;
