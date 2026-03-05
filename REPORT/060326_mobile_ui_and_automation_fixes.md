# Autochat Dashboard — Mobile UI & Automation Fixes
**Date:** 06/03/26 — Session Report
**Timestamp Start:** 04:16 WIB
**Timestamp End:** 04:47 WIB

---

## Problems Encountered & Solutions

### 1. ❌ AutomationWizard Missing Meta Props (ROOT CAUSE of 404)
- **Problem**: `<AutomationWizard>` di `Dashboard.tsx` dipanggil TANPA passing `metaInstagramId` dan `metaAccessToken`.
- **Impact**: `fetchIgPosts()` selalu mendapat `undefined` → silently return tanpa fetch → 404 jika di-force.
- **Root Cause**: Saat file di-rewrite oleh Gemini, props hilang dari JSX.
- **Fix**: Tambah `metaInstagramId={client?.meta_instagram_id}` dan `metaAccessToken={client?.meta_access_token}` di Dashboard.tsx line ~961.
- **File**: `src/pages/Dashboard.tsx`

### 2. ❌ Mobile Bottom Nav Not Matching DemoPanel
- **Problem**: Bottom nav dashboard mobile tidak identik dengan DemoPanel (6 item, styling berbeda).
- **Fix**: Buat array `bottomTabs` (5 item: Home, Bot, Analitik, Audience, Profil) yang sama persis DemoPanel. Pakai `grid grid-cols-5 h-16` + `env(safe-area-inset-bottom)`.
- **File**: `src/pages/Dashboard.tsx`

### 3. ❌ Facebook Meta Card Overflow di Mobile
- **Problem**: Tombol "Refresh Token" dan "Disconnect" (teks panjang) melampaui border kanan di HP.
- **Fix**: Ganti ke DemoPanel pattern — icon-only buttons, `p-4 rounded-2xl`, `shrink-0` + `min-w-0 truncate`.
- **File**: `src/pages/Dashboard.tsx`

### 4. ❌ Auto-Replies Duplikat di Home Tab
- **Problem**: Automation list muncul di Home (Tab 1) DAN Bot (Tab 2) — duplikat.
- **Root Cause**: Kondisi `activeTab === "dashboard" || activeTab === "automations"`.
- **Fix**: Ubah jadi `activeTab === "automations"` saja.
- **File**: `src/pages/Dashboard.tsx`

### 5. ❌ Step 5 & Step 6 Ketukar di Wizard
- **Problem**: Step 5 = DM+Button, Step 6 = Follow Check. User mau Step 5 = Follow Check dulu, Step 6 = DM+Link.
- **Fix**: Swap kedua step. Step 5 sekarang tanya "Cek Follow? A. Ya / B. Tidak", Step 6 = isi DM dan tombol link.
- **File**: `src/components/AutomationWizard.tsx`

### 6. ✅ Profile Pic Instagram di Mobile Header
- **Problem**: Avatar di mobile header cuma tampil initial huruf, bukan foto IG.
- **Fix**: Tambah `ig_profile_pic_url` ke interface `AutochatClient`, render `<img>` jika tersedia.
- **File**: `src/pages/Dashboard.tsx`

### 7. ✅ Mobile Content Overflow
- **Problem**: Konten kadang melebar ke kanan melampaui layar HP.
- **Fix**: Tambah `overflow-x-hidden max-w-full` ke container konten mobile.
- **File**: `src/pages/Dashboard.tsx`

### 8. ✅ Smart 404 Fallback di fetchIgPosts
- **Problem**: Jika ID tersimpan adalah FB Page ID (bukan IG Business ID), API return 404.
- **Fix**: Tambah auto-fallback: jika 404, coba resolve IG ID dari Page ID via `/{id}?fields=instagram_business_account`.
- **File**: `src/components/AutomationWizard.tsx`

### 9. ✅ OAuth Scope Ditambah
- **Fix**: Tambah `business_management` ke scope FB.login agar Pages API bisa return `instagram_business_account`.
- **File**: `src/pages/Dashboard.tsx`

---

## Status Meta Props di Seluruh Komponen

| Komponen | Butuh Meta Props? | Status |
|----------|-------------------|--------|
| **AutomationWizard** | ✅ Ya (`metaInstagramId`, `metaAccessToken`) | ✅ FIXED — sekarang di-pass |
| **Audience Tab** | ❌ Tidak — reads dari Supabase `autochat_audience_logs` by `user_id` | ✅ OK — log ditulis oleh backend webhook, bukan frontend |
| **Analytics Tab** | ❌ Tidak — masih empty state placeholder | ✅ OK — belum ada fitur |
| **Pages Tab** | ❌ Tidak — reads `client.meta_access_token` langsung dari state | ✅ OK |
| **Settings Tab** | ❌ Tidak | ✅ OK |

**Kesimpulan**: Hanya `AutomationWizard` yang butuh meta props, dan sekarang sudah di-pass. Audience log sudah otomatis tersinkron karena data ditulis oleh backend (VPS webhook), bukan frontend.

---

## APP_VERSION History (Session ini)
| Version | Fix |
|---------|-----|
| 2026.03.06.15 | Mobile bottom nav & header fix |
| 2026.03.06.16 | Bottom nav `grid grid-cols-5` DemoPanel pattern |
| 2026.03.06.17 | All 6 issues fix (wizard swap, profile pic, overflow) |
| 2026.03.06.18 | Meta card compact (icon-only buttons) |
| 2026.03.06.19 | Remove auto-replies from Home tab |
| 2026.03.06.20 | Fix fetchIgPosts 404 + pass meta props to wizard |

## Files Modified
- `src/pages/Dashboard.tsx`
- `src/components/AutomationWizard.tsx`
- `src/main.tsx` (APP_VERSION × 6)
