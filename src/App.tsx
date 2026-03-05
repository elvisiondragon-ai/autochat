import { useEffect, useState, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { LanguageProvider } from "./contexts/LanguageContext";

// Lazy-loaded pages
const Landing = lazy(() => import("./pages/Landing"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AuthPage = lazy(() => import("./pages/Auth"));
const DemoPanel = lazy(() => import("./pages/DemoPanel"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const DataDeletion = lazy(() => import("./pages/DataDeletion"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Simple protected route — redirects to /auth if no session
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) return null; // loading
  if (!session) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/demopanel" element={<DemoPanel />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/data-deletion" element={<DataDeletion />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
