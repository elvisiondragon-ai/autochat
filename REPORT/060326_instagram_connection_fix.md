# Meta Ads & Instagram Connection Fix
**Date:** 06 March 2026
**Topic:** Instagram Specific Post Selection Failure in Automation

## Root Problem Analysis
- **Problem**: Users were unable to select a "Specific Post" when creating an automation. The UI showed "Instagram belum terhubung atau tidak ada postingan" (Instagram not connected or no posts available) despite the user having successfully clicked "Connect Meta" on the Dashboard.
- **Cause**: The `connectToMeta` function inside `Dashboard.tsx` was fundamentally flawed. When the Facebook OAuth popup successfully returned a payload, the function was **only** extracting and saving the `access_token` into the `autochat_clients` database table. It was failing to query the Graph API to find the user's Facebook Pages and their associated Instagram Business Account IDs.
- **Impact**: The database state (`meta_access_token` = filled, `meta_instagram_id` = null) tricked the Dashboard UI into showing a green "Connected" badge. However, when the `AutomationWizard.tsx` attempted to fetch posts via `fetchIgPosts()`, it silently failed because the `metaInstagramId` parameter was null, leading to empty post grids and confusing UX.

## Solutions Implemented
### 1. Enhanced Graph API Fetch in Dashboard
- Updated `Dashboard.tsx`'s `saveToken` logic inside the `FB.login` callback.
- Instead of immediately saving just the token, the app now uses the fresh token to query `https://graph.facebook.com/v22.0/me/accounts?fields=id,name,instagram_business_account`.
- The logic iterates through the returned Facebook Pages to find the first one that has an attached `instagram_business_account`.
- Both the `meta_page_id` and the `meta_instagram_id` are extracted and saved to the Supabase `autochat_clients` table alongside the `meta_access_token`.

### 2. UI Conflict Fix in Automation Wizard
- Fixed a nested `onClick` event propagation issue in `AutomationWizard.tsx` that caused the "Specific Post" radio button to collapse the grid before it could even render. Added `e.stopPropagation()` to the click handler.

### 3. Debug Information Panel
- Added a visual debug panel in the `AutomationWizard.tsx` empty state that exposes the raw values of `ID Instagram` and `Akses Token` directly to the user (e.g., "Kosong" vs "Tersimpan"), allowing faster troubleshooting in the future if tokens expire or Facebook disconnects the app.

## Required User Action
Since the old connection only stored the token, any user experiencing this issue must:
1. Go to the **Dashboard**.
2. Click the red **Disconnect** (Unplug) button to clear the flawed connection state.
3. Click **Connect Facebook** again to trigger the new logic that accurately fetches and saves the Instagram Business Account ID.

---

## Automation Wizard UI & Logic Updates
**Topic:** Improving Step-by-Step Flow and Button Clarity

### 1. Mandatory Button Fields (Step 5)
- **Problem**: Previously, users could skip the Button Text and URL fields, leading to broken DM replies that didn't actually contain the intended CTA (Call to Action).
- **Solution**: Made `Nama Tombol` and `URL Link` mandatory fields in Step 5. Added red asterisks and explicit validation to prevent moving to the next step if these are empty.

### 2. High-Fidelity Button Preview
- **Problem**: The live preview was only showing blue text for buttons, which didn't look like an actual clickable element.
- **Solution**: Upgraded the `PhonePreview` styling. Now, buttons appear as a clear, rounded blue box (`bg-[#0095f6]`) with white bold text, matching the real Instagram DM aesthetic.

### 3. Integrated DM & Button Layout
- **Problem**: The DM text and the button were appearing as two separate chat bubbles, which is technically incorrect for how Instagram renders automated replies.
- **Solution**: Merged the DM text and the Button into **one single chat bubble**. The button is now attached directly below the message text with a separator, providing a 1:1 preview of the final result.

### 4. Sequential Step Separation (Step 6)
- **Problem**: Step 5 was becoming too cluttered by combining DM content, button settings, and follow-check logic.
- **Solution**: Separated the **Follow Check** logic into its own dedicated **Step 6**. This ensures a cleaner UI and allows the user to focus on the preview before deciding whether to enforce a follow-check barrier.

### 5. Final Build & Versioning
- **Action**: Auto-incremented `APP_VERSION` to `2026.03.06.12` in `src/main.tsx` to force clear the cache for all users and ensure they receive these UI fixes immediately.
- **Status**: `npm run build` executed successfully.

