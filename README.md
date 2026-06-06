# ARMy Member Portal ⚜️
A secure, centralized member dashboard and event registration system built for the **Ambassador of Marketing Youth (ARMy)**, a student campus support club at Universiti Teknologi PETRONAS (UTP). 
This portal streamlines event management for the High Committee (HICOM) while providing a seamless, branded experience (Navy Blue and Gold) for club members to browse and join upcoming initiatives.

## ✨ Key Features

### 🔐 Secure Authentication & Access
* **Member Login/Sign-up:** Secure Email/Password authentication powered by Firebase.
* **Protected Routes:** The main dashboard is strictly locked behind authentication to ensure privacy.

### 📅 Event Management (HICOM/Admins)
* **Create Events:** Admins can publish new events specifying Title, Start/End Dates, and Descriptions.
* **Smart Filtering:** The dashboard automatically categorizes events into **Upcoming** (Active) and **Past** (Disabled) tabs based on real-time date comparisons.
* **P&C Data Protection:** A unique **Security PIN** is required when creating an event. This PIN must be entered to delete the event or download participant data, ensuring strict Private and Confidential (P&C) compliance.

### 📝 Member Registration
* **One-Click Join:** Active events feature a 'Join Event' button that opens a comprehensive registration form.
* **Data Collection:** Captures Full Name, Student ID, Email Address, Phone Number, and ARMy Department (Human Resources, Public Relations, Media and Promotion, Economy and Entrepreneurship).
* **Participant Management:** Event creators can view a clean table of registered participants and instantly export the data to a **CSV spreadsheet** (requires Security PIN).

## 🛠️ Tech Stack
* **Frontend:** React.js, Vite
* **Backend/Database:** Firebase Authentication, Cloud Firestore
* **Hosting:** Firebase Hosting
* **Styling:** Custom CSS (Corporate Navy Blue & Gold Theme)

## 🚀 Local Setup & Installation
Follow these steps to run the ARMy portal on your local machine:

**1. Clone the repository**
```bash
git clone [https://github.com/pedot123456/ARMy-Website.git](https://github.com/pedot123456/ARMy-Website.git)
cd ARMy-Website
```

**2. Install dependencies**
```bash
npm install

```

**3. Configure Firebase Environment Variables**
Create a `.env.local` file in the root directory and add your unique Firebase project keys:

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

## 🌐 Deployment
This project is configured for Firebase Hosting. To deploy a new version to the live URL:

```bash
npm run build
firebase deploy

```

---
**Developed by:** Muhammad Firdaus Zahin Bin Nurus Sham
**Organization:** Ambassador of Marketing Youth (ARMy) - Universiti Teknologi PETRONAS (2025/2026)
5. Click the green **Commit changes...** button at the top right. 

This will instantly make your repository look incredibly professional for future recruiters or university staff! Let me know if you need any tweaks to it.

```
