import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageSquare, Globe, Shield, BarChart3, ArrowRight, Facebook, Zap, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

const features = [
  { icon: MessageSquare, title: "Auto Messaging", description: "Balas komentar & DM Instagram otomatis 24/7 tanpa perlu selalu online." },
  { icon: Zap, title: "Instant Setup", description: "Hubungkan akun Facebook & Instagram dalam hitungan menit, langsung aktif." },
  { icon: Shield, title: "Aman & Terpercaya", description: "Token tersimpan aman dengan enkripsi AES-256, zero data breach." },
  { icon: BarChart3, title: "Analitik Real-Time", description: "Pantau pertumbuhan follower, komentar, dan engagement dari satu dashboard." },
];

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* ── Mobile-first Navbar ─────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/90 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/autochat.png" alt="Autochat" className="h-7 w-7 object-contain" />
            <span className="font-display text-base font-bold text-foreground">
              Autochat <span className="text-gradient">El Vision</span>
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="hero" size="sm" className="text-sm px-4" onClick={() => navigate("/auth")}>
              Mulai
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-14">
        {/* Glow blob */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/15 blur-[100px]" />
        </div>

        <div className="relative z-10 w-full px-4 py-16 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            {t('landing.hero.badge')}
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto max-w-sm font-display text-4xl font-bold leading-tight tracking-tight text-foreground sm:max-w-2xl sm:text-5xl md:text-6xl"
          >
            {t('landing.hero.title1')}{" "}
            <span className="text-gradient">{t('landing.hero.title2')}</span>

          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-4 max-w-sm text-base text-muted-foreground sm:max-w-md sm:text-lg"
          >
            {t('landing.hero.desc')}
          </motion.p>

          {/* CTA Buttons — full width on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col gap-3 px-4 sm:flex-row sm:justify-center sm:px-0"
          >
            <Button
              variant="facebook"
              size="lg"
              className="w-full gap-2 sm:w-auto sm:px-8"
              onClick={() => navigate("/auth")}
            >
              <Facebook className="h-4 w-4" />
              {t('landing.hero.cta.fb')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2 sm:w-auto sm:px-8"
              onClick={() => navigate("/demopanel")}
            >
              {t('landing.hero.cta.demo')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 grid grid-cols-3 gap-4 border-t border-border/40 pt-8"
          >
            {[
              { value: "10K+", label: t('landing.stats.users') },
              { value: "50M+", label: t('landing.stats.messages') },
              { value: "99.9%", label: t('landing.stats.uptime') },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl font-bold text-foreground sm:text-3xl">{stat.value}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-12 flex justify-center"
          >
            <ChevronDown className="h-5 w-5 text-muted-foreground animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* ── How It Works (image) ────────────────────────────────────── */}
      <section className="py-10 bg-muted/20">
        <div className="px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-xl"
          >
            <div className="border-b border-border/40 bg-secondary/30 px-4 py-2.5 flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
              <div className="flex items-center gap-1 ml-2 text-[10px] text-muted-foreground font-mono">
                <Globe className="h-2.5 w-2.5" />
                autochat-flow-demo
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-background to-secondary/10">
              <img
                src="/how_autochat_works.png"
                alt="How Autochat Works"
                className="w-full h-auto rounded-lg object-contain"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section id="features" className="py-16 px-4">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            {t('landing.features.title1')}{" "}
            <span className="text-gradient">{t('landing.features.title2')}</span>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs mx-auto sm:max-w-md">
            {t('landing.features.desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="group flex gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <feature.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Block ───────────────────────────────────────────────── */}
      <section className="py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-border bg-card p-8 text-center shadow-lg"
        >
          <div className="mb-3 text-3xl">🚀</div>
          <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
            Siap Automasi Bisnis Kamu?
          </h2>
          <p className="mx-auto mt-3 max-w-xs text-sm text-muted-foreground">
            Bergabung bersama ribuan bisnis yang sudah menggunakan Autochat El Vision.
          </p>
          <Button
            variant="hero"
            size="lg"
            className="mt-6 w-full sm:w-auto sm:px-10"
            onClick={() => navigate("/auth")}
          >
            Mulai Gratis Sekarang <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </motion.div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-8 px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <img src="/autochat.png" alt="Autochat" className="h-5 w-5 object-contain" />
            <span className="font-display text-sm font-semibold text-foreground">Autochat El Vision</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => navigate("/terms")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</button>
            <button onClick={() => navigate("/privacy")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</button>
            <button onClick={() => navigate("/data-deletion")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Data Deletion</button>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Autochat El Vision. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
