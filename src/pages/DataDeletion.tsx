import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, CheckCircle2, Loader2, Mail, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const DataDeletion = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [confirmationCode, setConfirmationCode] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Generate a deletion request confirmation code
            const code = "DEL-" + Date.now().toString(36).toUpperCase();
            setConfirmationCode(code);

            // Send deletion request email via elvisiongroup edge function
            const SUPABASE_URL = "https://nlrgdhpmsittuwiiindq.supabase.co";
            const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5scmdkaHBtc2l0dHV3aWlpbmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDk0NTQsImV4cCI6MjA2OTk4NTQ1NH0.62U0WBImD8aT8mJvHv4xysGsp4IyV1A4a26OlTdOpVw";

            await fetch(`${SUPABASE_URL}/functions/v1/autochat-clients`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": ANON_KEY,
                },
                body: JSON.stringify({
                    action: "request_deletion",
                    email: email.toLowerCase().trim(),
                    reason,
                    confirmation_code: code,
                }),
            }).catch(() => null); // Non-blocking if edge function not yet updated

            setSubmitted(true);
            toast({ title: "Permintaan diterima", description: `Kode: ${code}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="container mx-auto flex h-16 items-center justify-between px-6">
                    <button onClick={() => navigate("/")} className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center">
                            <img src="/autochat.png" alt="Autochat Logo" className="h-7 w-7 object-contain drop-shadow-md" />
                        </div>
                        <span className="font-display text-lg font-bold text-foreground">
                            Autochat <span className="text-gradient">El Vision</span>
                        </span>
                    </button>
                </div>
            </nav>

            <main className="container mx-auto max-w-2xl px-6 pb-24 pt-28">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <button onClick={() => navigate(-1)} className="mb-6 flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </button>

                    <div className="mb-8 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                            <Trash2 className="h-6 w-6 text-destructive" />
                        </div>
                        <div>
                            <h1 className="font-display text-3xl font-bold text-foreground">Data Deletion Request</h1>
                            <p className="text-sm text-muted-foreground">Permintaan hapus data akun Anda</p>
                        </div>
                    </div>

                    {submitted ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-xl border border-success/30 bg-success/5 p-8 text-center"
                        >
                            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-success" />
                            <h2 className="font-display text-xl font-bold text-foreground">Permintaan Diterima</h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Kode konfirmasi Anda:
                            </p>
                            <p className="mt-2 rounded-lg bg-secondary px-4 py-2 font-mono text-lg font-bold text-foreground inline-block">
                                {confirmationCode}
                            </p>
                            <p className="mt-4 text-sm text-muted-foreground">
                                Simpan kode ini. Tim kami akan memproses penghapusan data Anda dalam <strong className="text-foreground">72 jam</strong> dan mengirim konfirmasi ke email <strong className="text-foreground">{email}</strong>.
                            </p>
                            <p className="mt-3 text-xs text-muted-foreground">
                                Data yang akan dihapus: akun, token Meta/Facebook, konfigurasi trigger, dan semua data terkait.
                            </p>
                        </motion.div>
                    ) : (
                        <>
                            {/* Info box */}
                            <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="font-medium text-foreground text-sm">Yang akan dihapus:</p>
                                        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                                            <li>Akun dan profil Anda</li>
                                            <li>Token akses Facebook & Instagram yang tersimpan</li>
                                            <li>Semua konfigurasi trigger dan automation</li>
                                            <li>Riwayat aktivitas di platform Autochat</li>
                                        </ul>
                                        <p className="text-xs text-muted-foreground pt-1">
                                            Penghapusan bersifat permanen dan tidak dapat dibatalkan. Diproses dalam 72 jam.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 space-y-5">
                                <div className="space-y-1.5">
                                    <Label htmlFor="del-email">Email akun Anda</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="del-email"
                                            type="email"
                                            className="pl-9"
                                            placeholder="email@domain.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="del-reason">
                                        Alasan <span className="text-muted-foreground text-xs">(opsional)</span>
                                    </Label>
                                    <textarea
                                        id="del-reason"
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px] resize-none"
                                        placeholder="Ceritakan alasan penghapusan data (opsional)..."
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    variant="destructive"
                                    className="w-full gap-2"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                    Kirim Permintaan Hapus Data
                                </Button>
                            </form>

                            <p className="mt-4 text-center text-xs text-muted-foreground">
                                Anda juga dapat mencabut akses Autochat langsung dari{" "}
                                <a
                                    href="https://www.facebook.com/settings?tab=applications"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary underline"
                                >
                                    Facebook App Settings
                                </a>
                            </p>
                        </>
                    )}
                </motion.div>
            </main>
        </div>
    );
};

export default DataDeletion;
