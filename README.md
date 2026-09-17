# Fontastic 🎨🔍
> **The Ultimate Visual Typography Intelligence Platform, Crosshair Screen Viewfinder & Cloud Font Manager**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB%20Atlas-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 🌟 Overview

**Fontastic** is an end-to-end typography discovery and identification ecosystem built for graphic designers, UI/UX engineers, and creative agencies. 

Unlike traditional font identifier websites that require tedious manual screenshots and browser uploads, **Fontastic** lives natively in the OS tray. Pressing a single global hotkey summons an instant transparent screen viewfinder over any app, website, video, or PDF. Captured letterforms are analyzed using a **dual-engine pipeline**: computer vision geometric contour analysis combined with microscopic, glyph-by-glyph forensic evaluation via **Google Gemini 3.6 Flash**.

---

## 🚀 Key Features

### 🎯 1. Universal Global Screen Viewfinder (`F9` / `Ctrl + Shift + F`)
- **Snip From Anywhere:** Capture typography directly inside Adobe Illustrator, Figma, Photoshop, Chrome, video games, or video players.
- **Native OS Tray Integration:** Runs silently in the background with a high-performance system tray agent.
- **Transparent Interactive HUD:** Real-time crosshair coordinate tracking with marquee selection and instant freeze-frame preview.

### 🧠 2. Multimodal AI & Forensic Typography Engine
- **Microscopic Forensic Inspection:** Uses Gemini 3.6 Flash to inspect critical distinctive glyph anatomy:
  - Apex joints and vertex angles (e.g., crossing diagonals of `W` vs separate vertices in *Akira Expanded* vs *Helvetica*).
  - Terminal cuts and leg curves (e.g., straight diagonal vs curved leg of `R`).
  - Bowl shapes, apertures, and stroke stress modulation.
- **Negative Guardrails:** Specifically conditioned against statistical bias to avoid defaulting to generic workhorses like *Helvetica* or *Arial* when specialized display/extended fonts are provided.
- **Computer Vision Metric Profiling:** Vertical column projection profiling, aspect ratio evaluation, and classification across **Google Fonts**, **DaFont**, **Adobe Fonts**, and **MyFonts**.
- **Real-Time Scanning Feedback:** Animated radar laser HUD providing real-time status as OCR, feature extraction, and AI reasoning progress.

### 👑 3. Integrated Administrator Control Panel
- **Overview & KPI Analytics:** Real-time metrics on total users, active subscribers, weekly search distributions, and top identified font families.
- **Subscriber & User Management:** Inspect user profiles, modify search quotas, assign subscription tiers, or ban/activate accounts.
- **Monetization & Plan Builder:** Customize local BDT (৳) pricing tiers (e.g. *Basic ৳30*, *Standard ৳50*, *Pro Unlimited ৳300*), weekly quotas, and plan privileges.
- **Centralized AI Settings:** Configure and live-test the master Google Gemini API key from within the app so end-users never have to obtain their own API keys.
- **Admin Profile & Security:** Root administrator profile manager with live in-app credential and password modification.

### ☁️ 4. MongoDB Atlas Cloud Synchronization
- **Centralized Cloud Database:** Automatically mirrors all registered users, subscription plans, scan histories, wishlists, and global settings to MongoDB Atlas.
- **Dual-Write Architecture:** High-speed local cache for instant sub-millisecond offline performance with background asynchronous cloud syncing.

### 📦 5. Curated Font Catalog & Local Activation
- **Rich Font Library:** Built-in extended, brutalist, luxury serif, geometric sans, and display categories (Akira Expanded, Syne, Druk Wide, Bodoni, Cinzel, Space Grotesk, and more).
- **Direct Download & Installation:** Direct 1-click links to Google Fonts, DaFont, and commercial foundries.

---

## 🏗️ Architecture & Monorepo Structure

The project is structured as an npm workspaces monorepo:

```
Fontastic/
├── apps/
│   ├── desktop/             # Electron Desktop Application
│   │   ├── electron/        # Main process, global hotkey manager, tray & transparent overlays
│   │   └── src/             # React UI: Viewfinder HUD, Font Finder, History, Admin Console
│   ├── api/                 # Node.js + Express Backend
│   │   ├── src/modules/     # Vision (Gemini + CV + OCR), Auth, Users, Plans, Admin
│   │   └── src/db/          # MongoDB Atlas (Mongoose) + Local JSON Storage sync
│   ├── admin/               # Standalone Web Admin Portal (Vite + React)
│   └── mobile/              # React Native (Expo) companion viewfinder app
├── packages/
│   ├── shared-types/        # Shared TypeScript interfaces and data models
│   └── design-tokens/       # Design system tokens and typography standards
├── scripts/                 # System verification and maintenance scripts
└── README.md
```

---

## 🛠️ Tech Stack

| Domain | Technology |
|---|---|
| **Desktop Core** | Electron, Node.js, Windows API Native Overlay |
| **Frontend** | React 18, TypeScript, Vite, Lucide Icons, Vanilla CSS |
| **Backend** | Express.js, TypeScript, Mongoose, JWT, bcryptjs |
| **AI & Vision** | Google Gen AI SDK (`@google/genai` Gemini 3.6 Flash), Tesseract.js, pngjs |
| **Database** | MongoDB Atlas (Cloud) + Local JSON Storage (Dual-Write) |
| **Mobile** | React Native, Expo |

---

## 🚦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (v9 or higher)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or local MongoDB)
- A [Google AI Studio Gemini API Key](https://aistudio.google.com/app/apikey) *(optional, for AI vision)*

### 1. Clone the Repository
```bash
git clone https://github.com/jimhpar/Fontastic.git
cd Fontastic
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Inside `apps/api/`, create a `.env` file based on `.env.example`:
```bash
cp apps/api/.env.example apps/api/.env
```
Fill in your configuration:
```env
PORT=4000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key

# Google Gemini API Key (can also be configured via Admin Panel inside the app)
GEMINI_API_KEY=your_gemini_api_key

# MongoDB Atlas Connection URI
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/fontastic?retryWrites=true&w=majority&appName=fontastic
```

### 4. Build the Packages
```bash
npm run build
```

### 5. Launch Fontastic

#### Run the Backend API:
```bash
npm --workspace=@fontastic/api run start
```

#### Run the Electron Desktop App:
```bash
# In a new terminal:
npm --workspace=@fontastic/desktop run preview -- --port 3000

# Launch the Electron shell:
npx electron apps/desktop/electron/main.cjs
```
*(Alternatively, on Windows you can double-click `run-desktop-app.bat`)*

---

## 🔑 Default Credentials

### Administrator Account:
- **Email:** `admin@fontastic.io`
- **Password:** `Admin123!`
> *Admins are automatically routed to the comprehensive Admin Control Panel upon login. Password and profile details can be updated directly from the **Profile & Password** section.*

### Test User Account:
- **Email:** `testuser@fontastic.io`
- **Password:** `User123!`
- **Plan:** Pro Unlimited (Unlimited weekly searches)

---

## ⌨️ Global Shortcuts

| Shortcut | Action |
|---|---|
| `F9` or `Ctrl + Shift + F` | Trigger Transparent Screen Viewfinder anywhere in Windows |
| `Esc` | Cancel Viewfinder selection |
| `Left Click + Drag` | Draw capture box around typography |

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.