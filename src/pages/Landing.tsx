import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageSquare, Globe, Shield, BarChart3, ArrowRight, Facebook, Zap, ChevronDown, Smartphone, CheckCircle2 } from "lucide-react";
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
  const [isYearly, setIsYearly] = useState(false);

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
        <div className="mx-auto max-w-4xl px-4">
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
            <div className="p-2 sm:p-4 bg-gradient-to-br from-background to-secondary/10 flex justify-center">
              <img
                src="/how_autochat_works.png"
                alt="How Autochat Works"
                className="w-full h-auto max-w-[280px] sm:max-w-none rounded-lg object-contain"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Mobile Friendly Highlight ───────────────────────────────── */}
      <section className="py-16 px-4 bg-background">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center gap-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-card to-primary/5 p-8 md:p-12 shadow-2xl overflow-hidden relative"
          >
            {/* Decorative Background Blur */}
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px] pointer-events-none" />

            <div className="flex-1 space-y-5 relative z-10 text-center md:text-left">
              <div className="inline-flex items-center justify-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-2 mx-auto md:mx-0">
                <Smartphone className="h-4 w-4" />
                <span>100% Mobile Friendly</span>
              </div>

              <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight text-foreground">
                Kelebihan Auto Chat <span className="text-gradient">El Vision</span>
              </h2>

              <div className="space-y-4 text-muted-foreground leading-relaxed text-[15px] md:text-base max-w-xl mx-auto md:mx-0">
                <p className="font-medium text-foreground">
                  Kami adalah Auto Chat yang 100% Mobile Friendly.
                </p>
                <p>
                  Banyak teman-teman kesulitan menggunakan chat automation karena harus bergantung pada laptop dan PC desktop?
                </p>
                <p>
                  Tenang, sistem kami dari desain awal <strong className="text-foreground">dikhususkan untuk penggunaan HP</strong>. Tanpa perlu menyentuh laptop sama sekali, setup automatisasi Facebook dan Instagram kamu bisa dilakukan kapan saja, dimana saja tanpa hambatan.
                </p>
              </div>

              <div className="pt-2 flex justify-center md:justify-start">
                <Button variant="default" className="rounded-full px-8 shadow-lg shadow-primary/20" onClick={() => navigate("/auth")}>
                  Daftar Lewat HP Sekarang
                </Button>
              </div>
            </div>

            <div className="w-full md:w-[350px] shrink-0 relative z-10 hidden md:block">
              {/* Optional Illustration Area, can put a floating phone mockup later - keeping it clean for now with a decorative card */}
              <div className="relative mx-auto w-64 h-[420px] rounded-[2.5rem] border-[8px] border-secondary/50 bg-background shadow-2xl overflow-hidden flex flex-col">
                <div className="h-6 w-32 bg-secondary/50 mx-auto rounded-b-xl absolute left-1/2 -translate-x-1/2 top-0" />
                <div className="flex-1 bg-gradient-to-b from-primary/5 to-background p-4 pt-10 flex flex-col gap-3">
                  <div className="h-10 w-full rounded-xl bg-card border border-border flex items-center px-3 gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center"><Zap className="h-3 w-3 text-primary" /></div>
                    <div className="h-2 w-20 bg-muted rounded-full" />
                  </div>
                  <div className="h-24 w-full rounded-xl bg-primary/10 border border-primary/20 p-3 flex flex-col justify-end">
                    <div className="h-2 w-1/2 bg-primary/30 rounded-full mb-2" />
                    <div className="h-2 w-3/4 bg-primary/20 rounded-full" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-10 flex-1 rounded-xl bg-card border border-border" />
                    <div className="h-10 flex-1 rounded-xl bg-card border border-border" />
                  </div>
                </div>
                <div className="h-12 border-t border-border/50 bg-secondary/30 flex items-center justify-around px-4">
                  <div className="h-1 w-8 bg-muted-foreground/30 rounded-full" />
                </div>
              </div>
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

      {/* ── Pricing ───────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-4 bg-muted/20">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Pilih Paket <span className="text-gradient">Autochat</span>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto sm:max-w-md">
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>Bulanan</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative inline-flex h-6 w-12 items-center rounded-full bg-primary/20 transition-colors focus:outline-none"
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-primary transition-transform ${isYearly ? "translate-x-7" : "translate-x-1"}`} />
            </button>
            <span className={`text-sm font-medium ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>
              Tahunan <span className="ml-1 rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] text-green-500">Hemat 20%</span>
            </span>
          </div>

        </div>

        <div className="mx-auto max-w-6xl grid grid-cols-1 gap-6 md:grid-cols-3 items-start">

          {/* Pro Tier */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="rounded-3xl border-2 border-primary bg-card p-8 shadow-xl relative scale-100 md:scale-105 z-10 flex flex-col h-full"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
              PALING POPULER
            </div>

            <h3 className="font-display text-xl font-semibold text-foreground mt-8">Pro</h3>
            <p className="text-sm text-muted-foreground mt-1">Untuk bisnis yang sedang berkembang</p>
            <div className="my-6">
              <span className="text-4xl font-bold text-foreground">Rp {isYearly ? '80.000' : '100.000'}</span>
              <span className="text-sm text-muted-foreground">/bulan</span>
            </div>
            <ul className="space-y-3 mb-8">
              {['Unlimited Automations', 'Analytics Advanced', 'Multi Akun Instagram & FB', 'Prioritas Support'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-foreground font-medium">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> {feature}
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              <Button variant="hero" className="w-full rounded-full" onClick={() => navigate("/auth")}>Upgrade ke Pro</Button>
            </div>
          </motion.div>

          {/* Free Tier */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-border bg-card p-8 shadow-sm flex flex-col h-full"
          >
            <h3 className="font-display text-xl font-semibold text-foreground mt-8">Free</h3>
            <p className="text-sm text-muted-foreground mt-1">Sempurna untuk mencoba</p>
            <div className="my-6">
              <span className="text-4xl font-bold text-foreground">Rp 0</span>
              <span className="text-sm text-muted-foreground">/bulan</span>
            </div>
            <ul className="space-y-3 mb-8">
              {['10 Automations', 'Akses Dashboard Basic', 'Koneksi 1 Akun Instagram'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> {feature}
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              <Button variant="outline" className="w-full rounded-full" onClick={() => navigate("/auth")}>Mulai Gratis</Button>
            </div>
          </motion.div>

          {/* Enterprise Tier */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-border bg-gradient-to-br from-card to-primary/5 p-8 shadow-sm flex flex-col h-full"
          >
            <h3 className="font-display text-xl font-semibold text-foreground flex items-center gap-2 mt-8">Enterprise <Zap className="h-4 w-4 text-primary fill-primary" /></h3>
            <p className="text-sm text-muted-foreground mt-1">Skala besar dengan AI Marketing</p>
            <div className="my-6">
              <span className="text-4xl font-bold text-foreground">Custom</span>
            </div>
            <ul className="space-y-3 mb-8">
              {['Generated Video Trailer (100/bln)', 'Image Marketing (up to 400/bln)', 'Marketing Top Tier', 'Dedicated CS & Setup'].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" /> <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              <Button variant="secondary" className="w-full rounded-full border border-border" onClick={() => window.open('https://wa.me/6281234567890', '_blank')}>Hubungi CS</Button>
            </div>
          </motion.div>

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
    </div >
  );
};

export default Landing;
