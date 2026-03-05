import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Zap, LayoutDashboard, FileText, Settings, LogOut, Facebook,
  CheckCircle2, XCircle, RefreshCw, Unplug, ChevronDown, MessageSquare,
  Instagram, MoreHorizontal, Users, TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface MockPage {
  id: string;
  name: string;
  category: string;
  isActive: boolean;
  hasInstagram: boolean;
  followers: string;
  messagesThisMonth: number;
}

const mockPages: MockPage[] = [
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

const Dashboard = () => {
  const navigate = useNavigate();
  const [connected] = useState(true);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-border bg-card">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold text-foreground">
            El Vision
          </span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                item.active
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
          <button
            onClick={() => navigate("/")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-8 backdrop-blur-xl">
          <h1 className="font-display text-xl font-semibold text-foreground">Dashboard</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm">
              {connected ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-foreground">Connected</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-destructive" />
                  <span className="text-foreground">Disconnected</span>
                </>
              )}
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground">
              U
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Connection Card */}
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
                    {connected
                      ? "Token expires in 47 days · Last refreshed 3 days ago"
                      : "Not connected. Click to authenticate with Facebook."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {connected ? (
                  <>
                    <Button variant="outline" size="sm" className="gap-2">
                      <RefreshCw className="h-3.5 w-3.5" />
                      Refresh Token
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:text-destructive">
                      <Unplug className="h-3.5 w-3.5" />
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button variant="facebook" size="sm" className="gap-2">
                    <Facebook className="h-4 w-4" />
                    Connect Facebook
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats */}
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

          {/* Pages List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Connected Pages</h2>
              <Button variant="outline" size="sm" className="gap-2">
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
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
