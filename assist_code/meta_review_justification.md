# Meta App Review Justification (Autochat El Vision)

This document provides justifications for the requested Meta permissions to help you pass the App Review.

---

## 📄 App Overview
**Autochat El Vision** is an automation platform designed to help small business owners and creators manage their Instagram and Facebook interactions efficiently. The app allows users to set up "Auto-Replies" (triggers) based on specific keywords found in incoming Direct Messages or Comments on their business posts.

---

## 🔑 Permission Justifications (Main Descriptions)

### 1. `instagram_business_manage_messages`
**Use Case:** Reading and responding to Instagram Direct Messages.
**Justification:** Our app provides an automated responder service. When a user receives a DM that matches a pre-configured keyword (e.g., "Harga" or "Link"), our app must be able to read that message and send a structured response (text/buttons) immediately. This functionality is the core of our "Automation" feature and is impossible without this permission.

### 2. `instagram_business_content_publish`
**Use Case:** Scheduled and direct posting to Instagram.
**Justification:** The app allows business owners to maintain a consistent presence by scheduling and publishing posts, stories, and reels directly from the dashboard. This ensures that their content strategy and automated engagement (replies) are handled in one unified workflow.

### 3. `instagram_business_manage_insights`
**Use Case:** Retrieving metrics for accounts and posts.
**Justification:** We provide an analytics dashboard that helps users understand their audience engagement. By fetching impressions, reach, and engagement metrics, users can measure the success of their content and their automated keyword responses.

---

## 💬 Specific: `instagram_business_manage_messages` Review Answer

### 1. How will this app use `instagram_business_manage_messages`?
**Answer:** The app uses this permission to power its "Auto-Reply" features. When a customer sends a Direct Message to the user's Instagram Business account, the app identifies keywords in the message and sends an immediate automated response with product details, pricing, or helpful links. This provides 24/7 customer service for the business owner.

### 2. Review the policies for `instagram_business_manage_messages` and tell us how you intend to use it
**Answer:** We have reviewed the Instagram Messaging Policy and the Meta Platform Terms. We intend to use this permission strictly for "Standard Messaging" (responding to user-initiated messages within the 24-hour window). Our app provides automated responses that give users immediate information they requested, which aligns with Meta's goal of helpful, non-spammy interactions. We do not use this for bulk messaging or cold outreach.

### 3. Describe how your app uses this permission or feature
**Answer:** 
- **Receipt**: Our backend receives a real-time webhook notification when a customer sends a DM to the business.
- **Processing**: The message text is checked against keyword "triggers" set by the business owner in our dashboard.
- **Reply**: If a keyword matches, our app uses the `/me/messages` endpoint to send an instant reply with the pre-configured text or details.

### 4. Reproduction Instructions (For Meta Reviewers)
1.  **Login**: Connect an Instagram Business account to the dashboard.
2.  **Create Automation**: Go to "Bot" -> "Tambah Trigger".
3.  **Setup**: Use keyword `INFO_APP` and set reply to `Halo! Ini balasan otomatis dari Autochat.`.
4.  **Test**: Send DM `INFO_APP` to the business account from a separate Instagram account.
5.  **Result**: The automated reply will be received instantly.

---

## 📸 Specific: `instagram_business_content_publish` Review Answer

### 1. How will this app use `instagram_business_content_publish`?
**Answer:** This permission allows our users to draft, schedule, and publish media (images, videos) directly to their Instagram Business account from our dashboard. It integrates content management with our automation tools, allowing users to manage their entire Instagram presence in one place.

### 2. Review the policies for `instagram_business_content_publish` and tell us how you intend to use it
**Answer:** We comply with the Instagram Platform Policy by ensuring that all content published is explicitly created or selected by the user. Our app provides an interface for users to review their post, caption, and publication time before final submission. We do not support automated account creation or bulk-automated posting of generic content.

### 3. Describe how your app uses this permission or feature
**Answer:** 
- **User Input**: The user uploads their media file and types a caption in our dashboard.
- **Container Creation**: We call the Instagram Graph API to create a media container for the upload.
- **Publishing**: Once the container is ready, we call the media publish endpoint to post the content live onto the user's business profile.

### 4. Reproduction Instructions (For Meta Reviewers)
1.  Navigate to the "Content" or "Home" tab in the dashboard.
2.  Click "Create Post".
3.  Upload an image and write a caption.
4.  Click "Publish Now".
5.  Verify the post appears immediately on the connected Instagram Business profile.

---

## 📊 Specific: `instagram_business_manage_insights` Review Answer

### 1. How will this app use `instagram_business_manage_insights`?
**Answer:** The app uses this permission to display engagement data in our "Analytics" tab. We fetch account-level insights (reach/impressions) and media-level insights (likes/comments) so users can see how their audience is growing and interacting with their content.

### 2. Review the policies for `instagram_business_manage_insights` and tell us how you intend to use it
**Answer:** We comply by only showing analytics to the owner of the connected Instagram account. We do not share aggregated or user-specific metrics with third parties. The data is used solely to help the user understand their performance and optimize their automated responder and content strategy.

### 3. Describe how your app uses this permission or feature
**Answer:** 
- **Fetch**: We programmatically query the `/insights` and `/media` endpoints to retrieve performance metrics.
- **Display**: We visualize this data (e.g., Reach, Impressions, Total Likes) using charts and counts in the "Analytics" section of the dashboard.

### 4. Reproduction Instructions (For Meta Reviewers)
1.  Navigate to the "Analytics" or "Analitik" tab in the dashboard.
2.  Observe the data points for "Total Followers", "Reach", and "Messages Sent" loading and displaying current metrics for the account.

---

## 📽️ Final Screencast Guide (Comprehensive)
**Your submission MUST include `instagram_business_basic` to use these features.**
Your video should show:
1.  **Onboarding**: Connecting via Facebook login.
2.  **Automation**: Setting a keyword and receiving an auto-reply.
3.  **Publishing**: Publishing a post from the dashboard.
4.  **Analytics**: Viewing the metrics in the "Analytics" tab.

---

## 🔒 Data Privacy & Governance Review Answers

### 1. Data Processors or Service Providers
**Answer:** **Yes**
**Names of processors:**
- **Supabase, Inc.**: We use Supabase as our primary database and hosting provider for processing and storing platform data (User IDs, Tokens).
- **Meta Platforms, Inc.**: (Implicitly as the source of data).

### 2. Responsible Entity (Data Controller)
**Legal Entity Name:** **PT. SUMBER KESEHATAN ABADI** (or your personal name if registered as an individual).
**Country:** **Indonesia**

### 3. National Security Requests (Past 12 Months)
**Answer:** **No**.

### 4. Policies for Public Authority Data Requests
**Check all that apply:**
- [x] Required review of the legality of these requests.
- [x] Data minimization policy—the ability to disclose the minimum information necessary.
- [x] Documentation of these requests, including your responses.
