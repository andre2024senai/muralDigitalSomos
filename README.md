# 📺 Digital Mural — Church Digital Signage System

A full-featured **digital signage system** built for a church community. Content is managed through a rich admin panel and displayed in real time on TVs via browser — with live weather, QR codes, scheduled slides, and instant text announcements.

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)
![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=flat&logo=google-cloud&logoColor=white)

---

## 🎯 Project Overview

This project replaces printed posters and manual slideshows with a fully automated digital display system. Church staff upload photos to a shared Google Drive folder — the system handles everything else automatically: syncing content, scheduling slides, and broadcasting to any screen running a browser.

No technical knowledge required to operate after setup.

> 🟢 **Currently running in production at Somos Igreja, Jaraguá do Sul, Brazil.**

---

## ✨ Features

### 📺 Public Display (`index.html`)
- Real-time photo slideshow synced from Google Drive
- **Live weather widget** with current temperature and conditions
- **Live clock** displayed on screen
- **QR Code support** for events and announcements
- Fully automated — no manual refresh needed

### 🔐 Admin Panel (`admin.html`)
- **Secure login** with Firebase Authentication
- **Google Drive photo browser** — images from the folder load automatically into the panel
- **Multi-slide configurator** — set global caption, slide duration, start/end times per batch
- **"On Air Now"** live queue — shows all slides currently displaying (35+ items supported)
- **Quick Text Announcement** — send an instant text overlay to the display in real time
- **History log** — track previously published content
- **People Counter** — built-in attendance counting tool
- **Refresh Drive** button — manually reload folder contents on demand
- **Clear All / Start New** — reset the display with one click

---

## 🏗️ Architecture

```
Google Drive Folder (Image Storage)
        │
        ▼
Google Drive API v3 (Google Cloud)
        │
        ▼
Firebase Realtime Database (Sync + State)
Firebase Authentication (Admin Login)
Firebase Hosting (Deployment)
        │
        ├──▶ index.html   →  Public TV Display
        └──▶ admin.html   →  Staff Management Panel
```

---

## 📸 Screenshots

### 🔐 Admin Login
![Login Screen](screenshot-login.png)

### 📺 Public Display — TV Screen
![Public Display](screenshot-display.png)
*Live event banner with QR code for registration, real-time weather widget, and current time*

### 🎛️ Admin Panel — Mural Manager
![Admin Panel](screenshot-admin.png)
*Photo grid loaded from Google Drive, multi-slide configurator, live "On Air" queue, and quick announcement panel*

---

## 📁 Project Structure

```
muralDigitalSomos/
├── index.html        # Public mural display (runs on TV/browser)
├── mural.js          # Display logic: slideshow, weather, clock, real-time sync
├── admin.html        # Admin panel for content management
├── admin.js          # Admin logic: Drive integration, publish, announcements
├── firebase.json     # Firebase hosting configuration
├── .firebaserc       # Firebase project reference
├── 404.html          # Custom error page
└── package.json      # Project dependencies
```

---

## 🚀 How It Works

1. Staff uploads photos to a designated **Google Drive folder**
2. Admin opens the panel → clicks **"Refresh Drive"** or it auto-loads
3. Staff selects photos, sets slide duration and schedule, then publishes
4. Firebase syncs the queue to all active displays in real time
5. The **public screen** updates automatically — no page refresh needed
6. Staff can send **instant text announcements** that overlay the display immediately

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, JavaScript, Tailwind CSS |
| Authentication | Firebase Authentication |
| Real-time Sync | Firebase Realtime Database |
| Hosting | Firebase Hosting |
| Image Storage | Google Drive |
| Cloud API | Google Cloud Platform — Drive API v3 |

---

## ⚙️ Setup

```bash
# Clone the repository
git clone https://github.com/andre2024senai/muralDigitalSomos.git
cd muralDigitalSomos

# Install dependencies
npm install

# Login to Firebase
firebase login

# Deploy to Firebase Hosting
firebase deploy
```

> ⚠️ **Important:** Before running, configure your own credentials:
> - Google Cloud project with Drive API v3 enabled
> - Firebase project (Auth + Realtime Database + Hosting)
> - Add your API keys to the config files — never commit secrets to the repository

---

## 👨‍💻 Author

**André Francelino de Souza**
Java Backend Developer | Systems Development Instructor at SENAI Brazil
Background in industrial automation — building systems that work in the real world.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/andre-francelino-a8ab7067)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white)](https://github.com/andre2024senai)

---
