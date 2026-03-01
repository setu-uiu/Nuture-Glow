# Nurture Glow

Premium Mother, Pregnancy & Baby Care Platform.

## Tech Stack
- **Frontend**: React + Vite
- **Backend**: Express + MySQL (app data stored in MySQL tables)
- **Auth**: JWT (Bearer tokens)

## Local Development

### 1. Requirements
- Node.js 18+
- MySQL 8+

### 2. Backend
```bash
cd backend
npm install
npm run dev
```

Backend reads `backend/.env` (see `backend/.env.example`).
The API listens on `http://localhost:4000` by default.

### 3. Frontend
```bash
cd Nurture-Glow
npm install
npm run dev
```

Frontend reads `Nurture-Glow/.env` (see `Nurture-Glow/.env.example`).
Set `VITE_API_URL=http://localhost:4000` to point at the Express API.

## Notes
- Catalog data (doctors, hospitals, medicines) is seeded automatically on backend start.
- App data is persisted in MySQL tables created by the API on startup.

## Video Consultation + Google Calendar

1. Set backend Google OAuth variables in `backend/.env`:
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `GOOGLE_SCOPES`
2. Start backend and frontend.
3. Log in as a doctor and use the "Connect Google Calendar" button in the Telemedicine hub.
4. Create an online appointment, then open `/appointments/:id/video` to create the video session.
5. The session creates a Jitsi room and (optionally) a Google Calendar event.
