# FamilyGather — Setup Guide

## 1. Install Node.js

Node.js is not installed on this machine. Install it first:

**Option A — Official installer (easiest):**
Go to https://nodejs.org and download the LTS version.

**Option B — Homebrew:**
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node
```

**Option C — nvm (lets you switch versions):**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
nvm install --lts
```

---

## 2. Install dependencies

```bash
cd "/Users/bhanu/Event app"
npm install
```

---

## 3. Set up Firebase

1. Go to https://console.firebase.google.com
2. Create a new project (e.g. "familygather")
3. Enable **Firestore Database** (start in test mode)
4. Add a **Web App** (click the `</>` icon) and copy the config
5. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
6. Fill in your Firebase values in `.env.local`

---

## 4. Run locally

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

---

## 5. Deploy to Netlify

```bash
npm run build
```

Then either:
- **Drag & drop** the `dist/` folder to https://app.netlify.com/drop
- **Or connect GitHub** for auto-deploys

Set the environment variables from `.env.local` in Netlify → Site Settings → Environment Variables.

---

## How sharing works

1. First person creates the family → gets a shareable URL like `https://yoursite.netlify.app/family/abc123`
2. Family members open that link → pick their name → join automatically
3. All events, chats, and to-dos sync in real time via Firestore
