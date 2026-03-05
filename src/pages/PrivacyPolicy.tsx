import { motion } from "framer-motion";
import { ArrowLeft, Shield, Mail, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
    const navigate = useNavigate();

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

            <main className="container mx-auto max-w-3xl px-6 pb-24 pt-28">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <button onClick={() => navigate(-1)} className="mb-6 flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </button>
                    <div className="mb-8 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                            <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="font-display text-3xl font-bold text-foreground">Privacy Policy</h1>
                            <p className="text-sm text-muted-foreground">Last updated: March 5, 2026</p>
                        </div>
                    </div>

                    <div className="prose prose-sm max-w-none space-y-8 text-muted-foreground">

                        <section className="rounded-xl border border-border bg-card p-6 space-y-3">
                            <h2 className="font-display text-xl font-semibold text-foreground">1. Overview</h2>
                            <p>
                                Autochat El Vision ("we", "our", or "us"), operated by PT. El Vision Group, is a Meta-powered
                                chat automation platform at <strong className="text-foreground">autochat.elvisiongroup.com</strong>.
                                This Privacy Policy describes how we collect, use, and protect your personal information when
                                you use our service, including our integration with the Meta (Facebook & Instagram) platform.
                            </p>
                        </section>

                        <section className="rounded-xl border border-border bg-card p-6 space-y-3">
                            <h2 className="font-display text-xl font-semibold text-foreground">2. Information We Collect</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong className="text-foreground">Account information:</strong> Name, email address, phone number when you register.</li>
                                <li><strong className="text-foreground">Meta platform data:</strong> Facebook Page access tokens, Page IDs, Instagram account IDs — only after you explicitly grant permission via Meta OAuth.</li>
                                <li><strong className="text-foreground">Automation data:</strong> Trigger rules, message templates, and automation settings you configure.</li>
                                <li><strong className="text-foreground">Usage data:</strong> Log data, IP address, device type, and timestamps for security and analytics purposes.</li>
                            </ul>
                        </section>

                        <section className="rounded-xl border border-border bg-card p-6 space-y-3">
                            <h2 className="font-display text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>To provide and operate the Autochat El Vision service.</li>
                                <li>To send automated messages on your Facebook Page and Instagram on your behalf.</li>
                                <li>To authenticate your identity and manage your account.</li>
                                <li>To communicate with you about your account or service updates.</li>
                                <li>We do <strong className="text-foreground">NOT</strong> sell your personal data to third parties.</li>
                                <li>We do <strong className="text-foreground">NOT</strong> use your Meta tokens for any purpose other than executing automations you configure.</li>
                            </ul>
                        </section>

                        <section className="rounded-xl border border-border bg-card p-6 space-y-3">
                            <h2 className="font-display text-xl font-semibold text-foreground">4. Meta Platform Data</h2>
                            <p>
                                When you connect your Facebook Page or Instagram account, we receive an access token granted
                                by Meta on your behalf. This token is stored securely and used exclusively to:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Send automated replies to messages on your Page/Instagram.</li>
                                <li>Retrieve your connected Pages list.</li>
                                <li>Refresh your access token when it expires.</li>
                            </ul>
                            <p>
                                We comply with the{" "}
                                <a href="https://developers.facebook.com/policy" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                                    Meta Platform Policy
                                </a>{" "}
                                and{" "}
                                <a href="https://developers.facebook.com/terms" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                                    Meta Terms of Service
                                </a>.
                            </p>
                        </section>

                        <section className="rounded-xl border border-border bg-card p-6 space-y-3">
                            <h2 className="font-display text-xl font-semibold text-foreground">5. Data Security</h2>
                            <p>
                                All data is stored on Supabase (hosted on AWS) with encrypted connections (HTTPS/TLS).
                                Access tokens are stored encrypted at rest. We apply role-level security (RLS) to ensure
                                each user can only access their own data.
                            </p>
                        </section>

                        <section className="rounded-xl border border-border bg-card p-6 space-y-3">
                            <h2 className="font-display text-xl font-semibold text-foreground">6. Data Retention</h2>
                            <p>
                                We retain your data for as long as your account is active. You may request deletion of
                                your account and all associated data at any time via our{" "}
                                <button onClick={() => navigate("/data-deletion")} className="text-primary underline">
                                    Data Deletion page
                                </button>.
                            </p>
                        </section>

                        <section className="rounded-xl border border-border bg-card p-6 space-y-3">
                            <h2 className="font-display text-xl font-semibold text-foreground">7. Your Rights</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Access your personal data stored in our system.</li>
                                <li>Request correction of incorrect data.</li>
                                <li>Request complete deletion of your account and data.</li>
                                <li>Disconnect your Facebook/Instagram account at any time from the Dashboard.</li>
                                <li>Revoke our app access directly from your{" "}
                                    <a href="https://www.facebook.com/settings?tab=applications" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                                        Facebook App Settings
                                    </a>.
                                </li>
                            </ul>
                        </section>

                        <section className="rounded-xl border border-border bg-card p-6 space-y-3">
                            <h2 className="font-display text-xl font-semibold text-foreground">8. Contact</h2>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-primary" />
                                <a href="mailto:privacy@elvisiongroup.com" className="text-primary underline">
                                    privacy@elvisiongroup.com
                                </a>
                            </div>
                            <p>PT. El Vision Group | Indonesia</p>
                        </section>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => navigate("/data-deletion")}
                                className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                                Request Data Deletion
                            </button>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default PrivacyPolicy;
