# ARMy Member Portal ⚜️

A secure, centralized member dashboard and event management system built for the **Ambassador of Marketing Youth (ARMy)**, a student campus support club at Universiti Teknologi PETRONAS (UTP).

This portal streamlines event management and duty tracking for the High Committee (HICOM) while providing a seamless, branded experience (Navy Blue & Gold) for club members to browse, join, and log duty hours for upcoming initiatives.

---

## ✨ Key Features

### 🔐 Secure Authentication & Access
- **Member Login / Sign-Up** — Secure Email & Password authentication powered by Firebase Auth.
- **Forgot Password** — Sends a Firebase password-reset email directly to the member's inbox, with a clean confirmation screen.
- **Protected Routes** — The member dashboard is locked behind authentication; unauthenticated users are redirected to the public view.
- **HICOM PIN Gate** — The Admin portal is protected by a static access PIN (`ARMy2025`) persisted per browser session via `sessionStorage`.

### 📅 Event Management
- **Create Events** — Admins publish new events with Title, Start/End Dates, Description, and an initial **Event Status** (Upcoming / Ongoing / Completed).
- **Event Status Toggles** — Event creators can change status directly from the event card via an inline dropdown. Setting an event to **Completed** immediately moves it to the Past Events tab and locks all action buttons.
- **Smart Tab Filtering** — Events with an explicit status use it as the source of truth; legacy events (no status field) fall back to date-based filtering.
- **Security PIN Protection** — A unique PIN set at creation is required to delete the event or download participant data (P&C compliance).

### 📝 Member Registration
- **Duplicate Prevention** — Members cannot register twice for the same event; the button is disabled after registration and a server-side check prevents race conditions.
- **Data Collected** — Full Name, Student ID, Email, Phone Number, ARMy Department.
- **Participant Export (CSV)** — Event creators can download a PIN-protected participant list as a CSV spreadsheet.

### ⏱️ Duty Hour Tracking
- **Log Duty Hours** — Registered members on active events can submit a duty log with start/end datetime. A real-time **Pay Summary** calculates:
  - Member Pay — RM 8 / hr
  - Club Contribution — RM 1 / hr
  - Total Invoice Amount — RM 9 / hr
- **Duplicate Duty Prevention** — The "Log Duty Hours" button locks to "Duty Submitted" once a log is recorded for that event.
- **Creator Duty Export (CSV)** — Event creators get a per-event "Duty Logs (CSV)" button to download all member duty records for that event.

### 🛡️ HICOM Admin Portal — Duty Tracker
- **Master Duty Logs Table** — Full-width table listing all duty records across all events, sortable by submission date.
- **Summary Tiles** — Five live stat cards: Total Records, Total Hours, Member Earnings, Club Collection, Total Invoice.
- **Event Filter** — Filter the table and stats by a specific event name.
- **Verification System** — Approve ✓ or Reject ✗ each duty record. Status is persisted to Firestore and reflected in row background colour (green / red / neutral).
- **Payment Status Tracking** — Per-row dropdown: **Pending Client Payment** → **Ready to Pay** → **Paid to Member**. Persisted to Firestore immediately on change.
- **Master CSV Export** — Downloads all visible records (respects active event filter) with columns: Member Name, Email, Event, Start/End Time, Hours, Pay, Club Contribution, Invoice Total, Verification, Payment Status.

### 🧭 Smart Navigation
- **Logged-in users** see: Events (dashboard), About Us, Leadership, Admin.
- **Logged-out users** see: About Us, Events (public), Leadership.
- Fully responsive with a mobile hamburger menu.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Styling | Tailwind CSS, Font Awesome (CDN) |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Hosting | Firebase Hosting |

---

## 🚀 Local Setup

**1. Clone the repository**
```bash
git clone https://github.com/pedot123456/utp-army-website.git
cd utp-army-website
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure Firebase environment variables**

Create a `.env.local` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**4. Run the development server**
```bash
npm run dev
```

---

## 🌐 Deployment

```bash
npm run build
firebase deploy
```

---

## 🗂️ Firestore Collections

| Collection | Purpose |
|---|---|
| `events` | Event records (title, dates, status, createdBy, deletionPin) |
| `events/{id}/participants` | Subcollection of member registrations per event |
| `duty_logs` | All member duty hour submissions (with verification & payment status) |
| `users` | Member profiles created on sign-up |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Login.jsx          # Auth (login, sign-up, forgot password)
│   ├── Header.jsx         # Responsive navbar with auth-conditional links
│   ├── Dashboard.jsx      # Member dashboard — events, registration, duty logging
│   ├── HicomDashboard.jsx # Admin portal — duty tracker, verification, payment status
│   ├── Hero.jsx
│   ├── AboutUs.jsx
│   ├── Events.jsx
│   ├── Activities.jsx
│   ├── Leaders.jsx
│   └── Footer.jsx
├── data/
│   ├── events.js
│   ├── leaders.js
│   └── departments.js
├── firebase.js            # Firebase app initialisation
└── main.jsx
```

---

**Developed by:** Muhammad Firdaus Zahin Bin Nurus Sham  
**Organisation:** Ambassador of Marketing Youth (ARMy) — Universiti Teknologi PETRONAS (2025/2026)
