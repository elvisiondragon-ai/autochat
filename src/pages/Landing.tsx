import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageSquare, Globe, Shield, BarChart3, ArrowRight, Facebook } from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: MessageSquare,
    title: "Auto Messaging",
    description: "Send automated messages through Messenger & Instagram DMs to engage your audience 24/7.",
  },
  {
    icon: Globe,
    title: "Instant Connection",
    description: "Connect your Facebook Pages and Instagram accounts in seconds with OAuth 2.0 integration.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "AES-256 encrypted token storage, automatic refresh, and complete audit trail.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track message delivery, engagement rates, and audience growth in real-time.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center">
              <img src="/autochat.png" alt="Autochat Logo" className="h-7 w-7 object-contain drop-shadow-md" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">
              Autochat <span className="text-gradient">El Vision</span>
            </span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
            <a href="#docs" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Docs</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
              Masuk
            </Button>
            <Button variant="hero" size="sm" onClick={() => navigate("/auth")}>
              Mulai Gratis
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        {/* Background glow effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute right-1/4 top-1/2 h-64 w-64 rounded-full bg-primary/5 blur-[100px]" />
        </div>

        <div className="container relative z-10 mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground"
          >
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Now supporting Instagram DMs & Messenger
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mx-auto max-w-4xl font-display text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl"
          >
            Automate Your{" "}
            <span className="text-gradient">Facebook & Instagram</span>{" "}
            Messaging
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            Connect your Pages, set up auto-replies, and grow your business with
            intelligent chat automation. Powered by Meta's Graph API.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button
              variant="facebook"
              size="lg"
              className="h-13 gap-3 px-8 text-base"
              onClick={() => navigate("/auth")}
            >
              <Facebook className="h-5 w-5" />
              Connect with Facebook
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-13 gap-2 px-8 text-base"
              onClick={() => navigate("/dashboard")}
            >
              See Demo Panel
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mx-auto mt-20 grid max-w-3xl grid-cols-3 gap-8"
          >
            {[
              { value: "10K+", label: "Active Users" },
              { value: "50M+", label: "Messages Sent" },
              { value: "99.9%", label: "Uptime" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-3xl font-bold text-foreground md:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center"
          >
            <motion.h2
              custom={0}
              variants={fadeUp}
              className="font-display text-3xl font-bold text-foreground md:text-5xl"
            >
              Everything you need to{" "}
              <span className="text-gradient">automate</span>
            </motion.h2>
            <motion.p
              custom={1}
              variants={fadeUp}
              className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground"
            >
              From connecting your accounts to sending millions of messages — we handle it all.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i + 2}
                variants={fadeUp}
                className="group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-12 card-shadow"
          >
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Ready to automate your messaging?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Join thousands of businesses using Autochat El Vision to engage customers automatically.
            </p>
            <Button
              variant="facebook"
              size="lg"
              className="mt-8 h-13 gap-3 px-10 text-base"
              onClick={() => navigate("/auth")}
            >
              <Facebook className="h-5 w-5" />
              Mulai Gratis
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center">
              <img src="/autochat.png" alt="Autochat Logo" className="h-5 w-5 object-contain drop-shadow-md" />
            </div>
            <span className="font-display text-sm font-semibold text-foreground">
              Autochat El Vision
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/terms")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </button>
            <button
              onClick={() => navigate("/privacy")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => navigate("/data-deletion")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Data Deletion
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Autochat El Vision. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
