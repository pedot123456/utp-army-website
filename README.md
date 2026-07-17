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
- **Master Duty Logs Table** — Full-width table listing all duty records across all events, sortable by submission date. Horizontally scrollable on mobile.
- **Summary Tiles** — Five live stat cards: Total Records, Total Hours, Member Earnings, Club Collection, Total Invoice.
- **Event Filter** — Filter the table and stats by a specific event name.
- **Verification System** — Approve ✓ or Reject ✗ each duty record. Status is persisted to Firestore and reflected in row background colour (green / red / neutral).
- **Payment Status Tracking** — Per-row dropdown: **Pending Client Payment** → **Ready to Pay** → **Paid to Member**. Persisted to Firestore immediately on change.
- **Master CSV Export** — Downloads all visible records (respects active event filter) with columns: Member Name, Email, Event, Start/End Time, Hours, Pay, Club Contribution, Invoice Total, Verification, Payment Status.

### 🎨 Parallax Scrolling (Public Pages)
- **HeroParallax** — Full-viewport hero with four depth layers (gradient sky at 0.32×, gold ambient blobs at 0.20×, ARMy logo at 0.10×, foreground text at 1×) using a pure JS + `requestAnimationFrame` approach — no external library, works on all browsers including iOS Safari.
- **Parallax Bands** — Two decorative `ParallaxBand` dividers on the home page: an ARMy motto band between the Hero and Leadership sections, and an Events CTA band before the Events grid.
- **About Us Parallax** — The page banner and a mid-page "Meet the Team" divider both use the same parallax engine.
- **Admin pages untouched** — Dashboard, HicomDashboard, and Login remain fully static for reliable data management.

### 📱 Fully Responsive (Mobile-First)
- **Fluid layouts** — All containers use `w-full` / `max-w-7xl mx-auto` with `px-4 sm:px-6` horizontal padding so content never bleeds to the screen edge.
- **Stacking grids** — Multi-column layouts (event cards, form date fields, department cards) collapse to a single column on mobile via `grid-cols-1 sm:grid-cols-2`.
- **Hamburger menu** — Mobile nav uses a slide-down dropdown; desktop nav shows inline links.
- **Scrollable tables** — The Admin Duty Logs table is wrapped in `overflow-x-auto` with a 1280px min-width so mobile users swipe horizontally without breaking page layout.
- **Responsive text** — Section headlines scale down gracefully: `text-2xl sm:text-3xl md:text-5xl` pattern used across parallax bands and page headers.
- **Modals** — Use `w-full max-w-lg` with `p-3 sm:p-4` overlay padding, filling ~95% of the screen width on mobile.

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

## 🔥 Firebase Setup Requirements

### Firestore Security Rules
Paste the following into **Firebase Console → Firestore → Rules**:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{eventId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null
                    && request.auth.uid == resource.data.createdBy;
      allow delete: if request.auth != null;
      match /participants/{participantId} {
        allow read, create, delete: if request.auth != null;
      }
    }
    match /duty_logs/{logId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
                    && request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null;
    }
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null
                            && request.auth.uid == userId;
    }
  }
}
```

### Firestore Composite Index
Required for the duplicate duty-log check query. Create in **Firebase Console → Firestore → Indexes → Composite**:

| Collection | Field 1 | Field 2 |
|---|---|---|
| `duty_logs` | `userId` Ascending | `eventId` Ascending |

Or open the app while logged in — Firebase will log an error in the browser console with a direct link to auto-create the index.

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
│   ├── Login.jsx           # Auth (login, sign-up, forgot password)
│   ├── Header.jsx          # Responsive navbar with auth-conditional links
│   ├── Hero.jsx            # Full-viewport parallax hero section
│   ├── Parallax.jsx        # Reusable parallax hooks & ParallaxBand component
│   ├── Dashboard.jsx       # Member dashboard — events, registration, duty logging
│   ├── HicomDashboard.jsx  # Admin portal — duty tracker, verification, payment status
│   ├── AboutUs.jsx         # About page with parallax banner
│   ├── Leaders.jsx         # Leadership pyramid (desktop) / card grid (mobile)
│   ├── Events.jsx          # Public Instagram event embeds
│   ├── Activities.jsx
│   └── Footer.jsx
├── data/
│   ├── events.js
│   ├── leaders.js
│   └── departments.js
├── firebase.js             # Firebase app initialisation
└── main.jsx
```

---

**Developed by:** Muhammad Firdaus Zahin Bin Nurus Sham
**Organisation:** Ambassador of Marketing Youth (ARMy) — Universiti Teknologi PETRONAS (2025/2026)
