# 🥗 ResQFood — AI-Powered Food Rescue Platform

<div align="center">
  <img src="public/assets/resqfood-logo.png" alt="ResQFood Logo" width="80" />
  
  **From Surplus to Smiles.**
  
  An AI-powered platform connecting restaurants with nearby NGOs to rescue surplus food through smart matching, seamless coordination, and live delivery tracking.

  ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
  ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
  ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
  ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
  ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

</div>

---

## 🌟 Overview

ResQFood is a full-stack web application built for a hackathon that tackles food waste by creating a real-time coordination network between:

- 🍽️ **Restaurants** — list surplus food available for pickup
- 🏠 **NGOs** — discover and claim food donations for their beneficiaries
- 🚴 **Volunteers** — accept delivery assignments with live GPS tracking
- 👤 **Public** — view the platform's mission and impact

---

## ✨ Features

### 🔐 Authentication & Profiles
- Email/password registration and login via Supabase Auth
- Role-based access: Restaurant, NGO, Volunteer
- Auto-created profile records and role-specific database entries on signup
- Persistent sessions with JWT tokens

### 🍽️ Restaurant Dashboard
- Post surplus food donations with food category, quantity, pickup window, and dietary tags
- Real-time donation status tracking (Available → Reserved → Picked Up → Delivered)
- View and manage all your active and historical donations

### 🏠 NGO Dashboard
- Live feed of available food donations nearby
- One-click food claiming with atomic race condition protection
- Delivery tracking with volunteer GPS position
- Beneficiary management

### 🚴 Volunteer Dashboard
- View and accept open delivery assignments
- **Live GPS Tracking** — Start/Stop tracking with browser Geolocation API
- Real-time location updates sent to Supabase every 5–10 seconds
- Active delivery management with pickup & delivery confirmation

### 🗺️ Real-Time GPS Map
- Built with **Leaflet** + **OpenStreetMap** (no API key required)
- Live volunteer position updated via **Supabase Realtime**
- Distance and ETA display

### 🎨 3D Scroll Animation
- 300-frame PNG sequence rendered on a sticky `<canvas>` element
- Fully scroll-controlled — zero autoplay, zero video files
- Hardware-accelerated and mobile-friendly

### 🔔 Notifications
- Real-time notification bell with unread count badge
- Notifications for donation claims, volunteer assignments, and delivery updates

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS + custom CSS animations |
| **Auth** | Supabase Auth (email/password) |
| **Database** | Supabase PostgreSQL with Row Level Security |
| **Real-time** | Supabase Realtime (WebSocket subscriptions) |
| **Maps** | Leaflet + OpenStreetMap |
| **GPS Tracking** | Browser Geolocation API (`watchPosition`) |
| **Icons** | Lucide React |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)

### 1. Clone the repository
```bash
git clone https://github.com/samyak4628/teamastrademo.git
cd teamastrademo
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` and fill in your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set up the database
Go to your [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql/new) and run these migration files **in order**:

1. `supabase/migrations/20261001_initial_schema.sql`
2. `supabase/migrations/20261001_auth_profile_fixes.sql`
3. `supabase/migrations/20261001_database_integration_complete.sql`
4. `supabase/migrations/20261001_volunteer_locations.sql`

### 5. Disable email confirmation (for development)
In Supabase Dashboard → **Auth → Providers → Email** → toggle off **"Confirm email"**.

### 6. Start the development server
```bash
npm run dev
```

Visit `http://localhost:5173`

---

## 📁 Project Structure

```
teamastrademo/
├── public/
│   ├── assets/          # Logo, images
│   └── frames/          # 300 PNG frames for 3D scroll animation
├── src/
│   ├── components/      # All UI components
│   │   ├── Navbar.tsx
│   │   ├── HeroSection.tsx
│   │   ├── RestaurantDashboard.tsx
│   │   ├── NGODashboard.tsx
│   │   ├── VolunteerDashboard.tsx
│   │   ├── LiveDeliveryMap.tsx
│   │   └── ...
│   ├── lib/             # Business logic & API layer
│   │   ├── supabase.ts         # Supabase client
│   │   ├── AuthContext.tsx     # Auth state & methods
│   │   ├── donationStore.ts    # Real-time donation data
│   │   └── useVolunteerTracking.ts  # GPS tracking hook
│   └── types/
│       └── index.ts     # TypeScript type definitions
├── supabase/
│   └── migrations/      # Database schema SQL files
├── .env.example         # Environment variable template
└── vite.config.ts
```

---

## 🗄️ Database Schema

| Table | Description |
|---|---|
| `profiles` | User profiles linked to Supabase Auth |
| `restaurants` | Restaurant details and metadata |
| `ngos` | NGO organization details |
| `donations` | Food donation listings with status tracking |
| `donation_responses` | NGO claim records |
| `volunteer_assignments` | Delivery task assignments |
| `volunteer_locations` | Live GPS coordinates (Realtime) |
| `notifications` | In-app notification records |

All tables have **Row Level Security (RLS)** enabled with role-appropriate policies.

---

## 🌐 Deployment on Vercel

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import your repository
3. Vercel auto-detects **Vite** framework
4. Add environment variables in **Project Settings → Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy 🚀

---

## 👥 Team

**Team Astra** — Built for Hackathon 2026

| Name | Role |
|---|---|
| Samyak Pravin Dhainje | Full-Stack Developer & Team Lead |

---

## 📄 License

This project was built for hackathon demonstration purposes.

---

<div align="center">
  Made with ❤️ to fight food waste — <strong>ResQFood</strong>
</div>
