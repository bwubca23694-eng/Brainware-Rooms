# 🏠 Brainware Rooms — Room Finder for Brainware University Students

A full-stack MERN application that connects Brainware University students with nearby room/hostel owners.

## 🎯 Features

### Students
- Browse & search rooms near Brainware University
- Filter by type, price, amenities, gender preference
- View room details, photos, amenities, rules
- Send booking requests to owners
- Save/bookmark rooms
- Leave reviews & ratings
- Google OAuth or email signup
- Track all bookings in dashboard

### Room Owners
- Register as an owner & list properties
- Upload multiple photos (Cloudinary)
- Manage room availability
- View & respond to booking requests
- Owner analytics dashboard (views, bookings)

### Admin
- Approve/reject new room listings
- Approve/reject owner registrations
- Manage all users (ban, delete, role)
- View all bookings system-wide
- Analytics dashboard

## 📁 Project Structure

```
brainware-rooms/
├── backend/                    # Express.js API
│   ├── config/                 # DB, Cloudinary, Passport
│   ├── controllers/            # Auth, Rooms, Bookings, Admin, Owner
│   ├── middleware/             # JWT Auth, Role guards
│   ├── models/                 # User, Room, Booking, Review
│   ├── routes/                 # All API routes
│   ├── utils/                  # Email helper (Nodemailer)
│   └── server.js
└── frontend/                   # React app
    └── src/
        ├── components/         # Navbar, Footer, RoomCard
        ├── context/            # AuthContext
        ├── pages/
        │   ├── student/        # Student dashboard, Saved rooms
        │   ├── owner/          # Owner dashboard, Add/Edit/Manage rooms, Bookings
        │   └── admin/          # Admin dashboard, Users, Rooms, Bookings
        └── utils/              # Axios instance
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- Google Cloud Console project (for OAuth)
- Gmail app password

### 1. Clone & Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

### 2. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:5000/api
npm start
```

## 🔑 Environment Variables (Backend)

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Min 32-char secret for JWT |
| `JWT_EXPIRES_IN` | Token expiry (e.g., `7d`) |
| `SMTP_HOST` | SMTP server (smtp.gmail.com) |
| `SMTP_PORT` | 587 |
| `SMTP_USER` | Gmail address |
| `SMTP_PASS` | Gmail App Password |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | `http://localhost:5000/api/auth/google/callback` |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |
| `FRONTEND_URL` | `http://localhost:3000` |

## 🗺️ API Endpoints

### Auth
- `POST /api/auth/register` — Register (student/owner)
- `POST /api/auth/login` — Login
- `GET /api/auth/verify-email/:token` — Verify email
- `POST /api/auth/forgot-password` — Request reset
- `POST /api/auth/reset-password/:token` — Reset password
- `GET /api/auth/google` — Google OAuth
- `GET /api/auth/me` — Get current user *(auth)*
- `PUT /api/auth/profile` — Update profile *(auth)*
- `POST /api/auth/save-room/:roomId` — Toggle save room *(auth)*

### Rooms
- `GET /api/rooms` — List rooms (with filters)
- `GET /api/rooms/nearby` — Rooms near Brainware Univ
- `GET /api/rooms/:id` — Room details + reviews
- `POST /api/rooms` — Create room *(owner)*
- `PUT /api/rooms/:id` — Update room *(owner/admin)*
- `DELETE /api/rooms/:id` — Delete room *(owner/admin)*
- `POST /api/rooms/:id/reviews` — Add review *(student)*

### Bookings
- `POST /api/bookings/room/:roomId` — Book room *(student)*
- `GET /api/bookings/my` — My bookings *(student)*
- `PUT /api/bookings/:id/cancel` — Cancel *(student)*
- `GET /api/bookings/owner` — Owner's bookings *(owner)*
- `PUT /api/bookings/:id/status` — Confirm/reject *(owner)*

### Admin *(admin only)*
- `GET /api/admin/dashboard`
- `GET/PUT/DELETE /api/admin/users`
- `PUT /api/admin/users/:id/approve-owner`
- `GET /api/admin/rooms`
- `PUT /api/admin/rooms/:id/review`
- `GET /api/admin/bookings`

### Owner *(owner only)*
- `GET /api/owner/dashboard`
- `GET /api/owner/rooms`
- `PUT /api/owner/rooms/:id/toggle-availability`

## 🔐 User Roles
- **student** — Default for students. Can browse, book, review.
- **owner** — Register with owner role. Must be approved by admin to have rooms go live.
- **admin** — Full platform access. Create first admin directly in DB: `db.users.updateOne({email: "your@email.com"}, {$set: {role: "admin", isVerified: true}})`

## 📍 College Location
Brainware University is located at approximately **22.7225°N, 88.4821°E** (Barasat, West Bengal). The app calculates distance of each room from this coordinate automatically.

## 🏗️ Tech Stack

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, Passport.js (Google OAuth), Nodemailer, Cloudinary, Multer

**Frontend:** React 18, React Router v6, Axios, React Toastify, Leaflet Maps

---
Built for Brainware University Students · Barasat, West Bengal
