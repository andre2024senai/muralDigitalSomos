<img width="1364" height="588" alt="screenshot-admin" src="https://github.com/user-attachments/assets/5f2eefe1-d975-487c-b477-f786a919eae8" />
#  Digital Mural — Real-Time Event Display System

A **real-time digital signage platform** designed for live events, organizations, and community spaces.
Content is managed through a web-based admin panel and instantly broadcast to any screen using just a browser.

>  Currently running in production (live environment)

---

##  Live Demo

 [Digital Mural](https://muraldigital-71926js.web.app/) 

---

##  Overview

Digital Mural replaces static slides and manual presentation workflows with a **fully automated, real-time content delivery system**.

Non-technical users can upload images, schedule slides, and send live announcements — all without needing to refresh or restart the display.

---

##  Key Features

###  Public Display

* Real-time slideshow synced from cloud storage
* Live clock and weather widget
* QR codes for events and registrations
* Instant updates — no refresh required
* Runs on any browser (TV, tablet, or computer)

---

###  Admin Panel

* Secure authentication (Firebase Auth)
* Cloud-integrated media browser (Google Drive API)
* Multi-slide scheduling (duration, time window, batch control)
* Live "On Air" queue visualization
* Instant text announcements (real-time overlay)
* Content history tracking
* Built-in attendance counter
* One-click reset and content refresh

---

##  Technical Highlights

* Real-time synchronization using Firebase Realtime Database
* Event-driven architecture (no polling or manual refresh)
* Stateless display clients (runs on any browser)
* Decoupled media pipeline via Google Drive API
* Scalable to multiple displays simultaneously
* Designed for low-latency live environments

---

##  Real-World Usage

* Actively used in live events
* Supports 30+ concurrent slides
* Operated by non-technical staff
* Eliminates manual slideshow setup
* Reduces operational overhead during events

---

##  Architecture

```
Google Drive (Media Storage)
        │
        ▼
Google Drive API (Google Cloud)
        │
        ▼
Firebase Realtime Database (State + Sync)
Firebase Authentication (Access Control)
Firebase Hosting (Deployment)
        │
        ├──▶ Public Display (index.html)
        └──▶ Admin Panel (admin.html)
```

---

##  Design Decisions

* **Firebase Realtime Database** chosen for ultra-low latency updates
* **Google Drive** used to avoid building a custom media pipeline
* **Browser-based display** eliminates installation and simplifies deployment
* **Separation of concerns** between display and admin panel

---

##  Screenshots

###  Admin Login

![Login Screen](screenshot-login.png)

###  Public Display

![Public Display](screenshot-display.png)

###  Admin Panel

<img width="1364" height="588" alt="screenshot-admin" src="https://github.com/user-attachments/assets/72b46df4-2099-42b1-acec-4618c9ccedc2" />


---

##  Project Structure

```
muralDigitalSomos/
├── index.html
├── mural.js
├── admin.html
├── admin.js
├── firebase.json
├── .firebaserc
├── 404.html
└── package.json
```

---

##  Setup

```bash
git clone https://github.com/andre2024senai/muralDigitalSomos.git
cd muralDigitalSomos

npm install
firebase login
firebase deploy
```

---

##  Environment Configuration

Before running the project, configure your environment:

Create a `.env` file based on `.env.example`:

```
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_DATABASE_URL=
GOOGLE_DRIVE_CLIENT_ID=
```

>  Never commit credentials to the repository

---

##  Future Improvements

* Multi-tenant support (multiple organizations)
* Mobile admin interface
* Analytics dashboard (views, engagement)
* Push notifications for live updates

---

##  Author

**André Francelino de Souza**
Java Backend Developer | Systems Development Instructor

* Strong background in real-world systems and automation
* Focused on scalable, practical solutions

🔗 LinkedIn: https://linkedin.com/in/andre-francelino-a8ab7067
🔗 GitHub: https://github.com/andre2024senai

---
