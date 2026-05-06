# 🎯 F4F Scout — Instagram Intelligence Tool

[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg?style=flat-square)](LICENSE)

**F4F Scout** is a high-performance, aesthetically stunning web application designed to identify Instagram profiles with the highest probability of returning a follow. By analyzing follower-to-following ratios, engagement rates, and niche relevance, F4F Scout transforms brute-force growth into data-driven strategy.

---

## ✨ Key Features

## 🚀 Core Functionalities

### 🧠 Intelligence Engine: The F4F Score
The heart of the application is a sophisticated scoring algorithm that evaluates profiles on a scale of 0 to 100. Unlike simple tools that only look at follower counts, F4F Scout cross-references multiple data points:
*   **The Golden Ratio:** Heavily weighs accounts with a high Following-to-Follower ratio (e.g., following 2,000 but only having 500 followers). These are high-intent "follow-back" candidates.
*   **Engagement Velocity:** Analyzes recent likes and comments per post relative to follower count. This ensures you target active community members, not ghost accounts.
*   **Recency Validation:** Checks the timestamp of the last post. A user active in the last 24-48 hours is 5x more likely to notice a new follow than a dormant account.
*   **Niche Semantic Matching:** Scans bios and category tags for keywords relevant to your search, ensuring the follow-back is from a relevant audience.

### 🔍 Advanced Discovery Modules
F4F Scout provides four distinct ways to find your target audience:
*   **Account Scout:** Extract the "Followers" or "Following" list of any competitor or niche leader. Ideal for "stealing" an engaged audience from similar accounts.
*   **Audience Overlap (Multi-Account):** Input up to 5 handles to find the "super-fans" who follow multiple leaders in your niche. These users represent the core of the community.
*   **Topic Discovery (Niche):** Search by broad terms (e.g., *Street Photography*). The app discovers top creators and active participants in that specific vertical.
*   **Hashtag Pulse:** Target users who are currently posting under specific hashtags. This captures "live" interest and trending participation.

### 🎛️ Precision Filtering System
Turn thousands of results into a curated "Gold List" with our granular filter panel:
*   **Account Verification:** Toggle to include/exclude blue-check accounts (who rarely follow back).
*   **Privacy Guard:** Filter by Public/Private status. Private accounts often have higher follow-back rates but require manual approval.
*   **Business Intelligence:** Separate personal creators from business entities.
*   **Keyword Extraction:** Use comma-separated keywords to filter bios for specific interests or professional roles.
*   **Post Frequency:** Ensure your targets are consistent creators by setting minimum post count thresholds.

### 📈 Data Visualization & Analytics
Don't just look at a list; understand the market.
*   **Interactive Distribution Charts:** View a Canvas-rendered histogram of scores to see the overall "quality" of a search result.
*   **Ratio Categorization:** See at a glance if an audience is "celebrity-heavy" (low ratio) or "follow-back heavy" (high ratio).
*   **Top 10 Recommendations:** An instantly generated table of the most optimal targets based on a combined index of all metrics.

### 📤 Bulk Management & Export
*   **One-Click Copy:** Copy all profile URLs to your clipboard for use in third-party automation or manual outreach.
*   **Pro Export:** Download your curated, filtered, and sorted lists as **CSV** or **JSON** for use in CRM tools or spreadsheets.
*   **Session Persistence:** Favorite specific profiles to save them for later tracking.

---

## 🛠️ Tech Stack

*   **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
*   **Language:** JavaScript (ES6+)
*   **Styling:** Pure CSS Modules + Global Design System (Zero external UI libraries for maximum performance)
*   **Data Sourcing:** [RapidAPI](https://rapidapi.com/) (Instagram Scraper APIs)
*   **Deployment:** [Vercel](https://vercel.com/)
*   **State Management:** React Hooks (useState, useEffect, useCallback)

---

## 📥 Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/f4fscout.git
    cd f4fscout
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root directory:
    ```env
    RAPIDAPI_KEY=your_rapidapi_key_here
    RAPIDAPI_HOST=instagram-scraper-api2.p.rapidapi.com
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:3000`.

---

## 🎭 Demo Mode
No API key? No problem. F4F Scout features a **built-in Demo Mode** that generates realistic, algorithmically-weighted mock data. This allows you to explore the interface, test filters, and view analytics without consuming any API credits.

---

## 🌍 Deployment

This project is optimized for **Vercel**:
1.  Push your code to GitHub/GitLab.
2.  Import the project into Vercel.
3.  Add `RAPIDAPI_KEY` and `RAPIDAPI_HOST` as Environment Variables in the Vercel Dashboard.
4.  Deploy!

---

## ⚖️ Disclaimer

This tool is intended for **personal and educational purposes only**. Automated scraping of Instagram data may violate their Terms of Service. Use this tool responsibly and ethically. The developers are not responsible for any account restrictions or actions taken by Instagram.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="center">
  Built with 🎯 for smart growth.
</p>
