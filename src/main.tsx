import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// ==========================================
// CACHE BUSTING VERSION - CHANGE THIS TO FORCE RELOAD!
const APP_VERSION = "2026.03.06.33";
// ==========================================<-- Changed to force an update for Follower Only Verification Prefill

if (localStorage.getItem('v_cache') !== APP_VERSION) {
    // 1. Clear all Service Workers
    navigator.serviceWorker?.getRegistrations().then(regs => regs.forEach(r => r.unregister()));

    // 2. Clear all Browser Caches
    caches.keys().then(names => names.forEach(name => caches.delete(name)));

    // 3. Update version and Hard Reload
    localStorage.setItem('v_cache', APP_VERSION);
    window.location.reload();
}

createRoot(document.getElementById("root")!).render(<App />);
