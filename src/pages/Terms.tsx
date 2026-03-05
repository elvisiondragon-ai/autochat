import { motion } from "framer-motion";
import { ArrowLeft, FileText, Shield, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

const Terms = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-background">
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
                    <LanguageSwitcher />
                </div>
            </nav>

            <main className="container mx-auto max-w-3xl px-6 pb-24 pt-28">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <button onClick={() => navigate("/")} className="mb-6 flex w-fit items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        {t('nav.back')}
                    </button>
                    <div className="mb-8 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                            <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="font-display text-3xl font-bold text-foreground">Terms of Service</h1>
                            <p className="text-sm text-muted-foreground">Last updated: March 5, 2026</p>
                        </div>
                    </div>

                    <div className="space-y-6 text-muted-foreground">

                        <section className="rounded-xl border border-border bg-card p-6 space-y-3">
                            <h2 className="font-display text-xl font-semibold text-foreground">1. Agreement</h2>
                            <p>
                                By accessing or using Autochat El Vision ("Service") at <strong className="text-foreground">autochat.elvisiongroup.com</strong>,
                                operated by PT. El Vision Group ("Company"), you agree to be bound by these Terms of Service.
                                If you do not agree, do not use this Service.
                            </p>
                        </section>

                        <section className="rounded-xl border border-border bg-card p-6 space-y-3">
                            <h2 className="font-display text-xl font-semibold text-foreground">2. The Service</h2>
                            <p>
                                Autochat El Vision is a chat automation platform that allows users to connect their Facebook Pages
                                and Instagram accounts via the Meta Graph API, configure keyword triggers, and automatically send
                                direct messages (DMs) and comment replies.
                            </p>
                        </section>

                        <section className="rounded-xl border border-border bg-card p-6 space-y-3">
                            <h2 className="font-display text-xl font-semibold text-foreground">3. Eligibility</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>You must be at least 18 years old to use this Service.</li>
                                <li>You must have a valid Facebook/Instagram account and comply with Meta's Terms of Service.</li>
                                <li>You must be the authorized owner or administrator of any Facebook Page or Instagram account you connect.</li>
                            </ul>
                        </section>

                        <section className="rounded-xl border border-border bg-card p-6 space-y-3">
                            <h2 className="font-display text-xl font-semibold text-foreground">4. Acceptable Use</h2>
                            <p>You agree <strong className="text-foreground">NOT</strong> to use the Service to:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Send spam, unsolicited bulk messages, or engage in any abusive messaging behavior.</li>
                                <li>Violate Meta's Platform Policy, Community Standards, or Terms of Service.</li>
                                <li>Harass, threaten, or impersonate any person or entity.</li>
                                <li>Send messages containing illegal content, hate speech, or adult material without proper authorization.</li>
                                <li>Use the Service to conduct any unauthorized commercial activity or pyramid schemes.</li>
                            </ul>
                        </section>

                        <section className="rounded-xl border border-border bg-card p-6 space-y-3">
                            <h2 className="font-display text-xl font-semibold text-foreground">5. Meta Platform Compliance</h2>
                            <p>
                                Our Service integrates with the Meta Graph API. You acknowledge that:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>All automated messaging is subject to Meta's messaging limits and policies.</li>
                                <li>We operate under Meta's Platform Policy and only use approved permissions.</li>
                                <li>Meta may update its policies at any time; continued use of our Service is subject to those updates.</li>
                                <li>We are not affiliated with Meta Platforms, Inc.</li>
                            </ul>
                        </section>

                        <section className="rounded-xl border border-border bg-card p-6 space-y-3">
                            <h2 className="font-display text-xl font-semibold text-foreground">6. Account & Tokens</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>You are responsible for keeping your account credentials secure.</li>
                                <li>Your Meta access tokens are stored securely and used solely to execute your configured automations.</li>
                                <li>You may revoke our access at any time from your Facebook App Settings.</li>
                                <li>We will never use your tokens to post content not configured by you.</li>
                            </ul>
                        </section>

                        <section className="rounded-xl border border-border bg-card p-6 space-y-3">
                            <h2 className="font-display text-xl font-semibold text-foreground">7. Subscription & Payments</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Free plan: limited features as described on our dashboard.</li>
                                <li>Paid plan: unlocks full automation features. Managed via our payment system.</li>
                                <li>Refunds are handled on a case-by-case basis. Contact <a href="mailto:support@elvisiongroup.com" className="text-primary underline">support@elvisiongroup.com</a>.</li>
                            </ul>
                        </section>

                        <section className="rounded-xl border border-border bg-card p-6 space-y-3">
                            <h2 className="font-display text-xl font-semibold text-foreground">8. Limitation of Liability</h2>
                            <p>
                                The Service is provided "as is." PT. El Vision Group is not liable for:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Consequences of Meta API changes, downtime, or policy enforcement.</li>
                                <li>Loss of data, revenue, or business opportunity arising from use of the Service.</li>
                                <li>Third-party content sent or received through the Service.</li>
                            </ul>
                        </section>

                        <section className="rounded-xl border border-border bg-card p-6 space-y-3">
                            <h2 className="font-display text-xl font-semibold text-foreground">9. Termination</h2>
                            <p>
                                We reserve the right to suspend or terminate your account without notice if you violate these Terms,
                                abuse the Meta platform, or engage in any harmful behavior. You may also delete your account at any time
                                via our Data Deletion page.
                            </p>
                        </section>

                        <section className="rounded-xl border border-border bg-card p-6 space-y-3">
                            <h2 className="font-display text-xl font-semibold text-foreground">10. Governing Law</h2>
                            <p>These Terms are governed by the laws of the Republic of Indonesia.</p>
                        </section>

                        <section className="rounded-xl border border-border bg-card p-6 space-y-3">
                            <h2 className="font-display text-xl font-semibold text-foreground">11. Contact</h2>
                            <p>
                                Questions? Email us at{" "}
                                <a href="mailto:legal@elvisiongroup.com" className="text-primary underline">legal@elvisiongroup.com</a>
                                <br />PT. El Vision Group | Indonesia
                            </p>
                        </section>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => navigate("/privacy")}
                                className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Shield className="h-4 w-4" /> Privacy Policy
                            </button>
                            <button
                                onClick={() => navigate("/data-deletion")}
                                className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" /> Data Deletion
                            </button>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default Terms;
