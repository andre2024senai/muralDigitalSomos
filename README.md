# 📸 Digital Church Mural

A real-time digital photo mural built for a church community, displayed on an LG TV via browser. Church staff can manage content through an admin panel — no technical knowledge required.

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)
![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=flat&logo=google-cloud&logoColor=white)

---

## 🎯 Project Overview

This project solves a real communication problem for a church community. Instead of printed posters or manual slideshows, photos uploaded to a shared Google Drive folder are automatically displayed on a TV screen in the church — in real time, with no manual intervention after setup.

---

## ✨ Features

- **Real-time sync** — Photos uploaded to Google Drive appear automatically on the display
- **Admin panel** — Left sidebar navigation with mural manager, refresh and publish controls, and a notifications area
- **Non-technical friendly** — Content managers update the mural without writing any code
- **Zero installation on display** — Runs on any browser-enabled TV or screen
- **Firebase hosting** — Fast, reliable, and globally distributed

---

## 🏗️ Architecture

```
Google Drive Folder
        │
        ▼
Google Drive API (Google Cloud)
        │
        ▼
Firebase (Real-time sync + Hosting)
        │
        ├──▶ index.html  →  Public Display (LG TV / Browser)
        └──▶ admin.html  →  Admin Panel (Church Staff)
```

---

## 📁 Project Structure

```
muralDigitalSomos/
├── index.html        # Public mural display (runs on TV)
├── mural.js          # Mural display logic and Google Drive integration
├── admin.html        # Admin panel for content management
├── admin.js          # Admin logic: folder refresh, publish controls
├── firebase.json     # Firebase hosting configuration
├── .firebaserc       # Firebase project settings
├── 404.html          # Custom error page
└── package.json      # Project dependencies
```

---

## 🚀 How It Works

1. A church staff member uploads photos to a designated **Google Drive folder**
2. The **Google Drive API** (via Google Cloud) fetches the images
3. **Firebase** syncs the data in real time
4. The **public display** (`index.html`) updates automatically on the TV
5. The **admin panel** (`admin.html`) allows staff to refresh the folder, preview images, and publish the mural with a single click

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, JavaScript, Tailwind CSS |
| Real-time & Hosting | Firebase |
| Image Storage | Google Drive |
| Cloud API | Google Cloud (Drive API v3) |

---

## 📋 Prerequisites

- Node.js installed
- Firebase CLI (`npm install -g firebase-tools`)
- Google Cloud project with Drive API enabled
- Firebase project created

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

> ⚠️ **Note:** You will need to configure your own Google Drive API credentials and Firebase project settings before running the project.

---

## 📸 Screenshots

> *(Add screenshots of the mural display and admin panel here)*

---

## 👨‍💻 Author

**André Francelino de Souza**
Java Backend Developer | Systems Development Instructor at SENAI Brazil

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/your-profile)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white)](https://github.com/andre2024senai)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
