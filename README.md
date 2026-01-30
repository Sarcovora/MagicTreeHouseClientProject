# TreeFolks User Portal

A full-stack application for tracking tree planting projects with Airtable integration.

## Quick Start

### Backend
```bash
cd backend
npm install
node server.js
# Runs on http://localhost:3000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## Project Structure

```
root/
├── backend/               # Node.js + Express API server
├── frontend/              # React + Vite application
├── documentation/         # All project documentation
└── README.md             # This file
```

## 🔐 Authentication Workflow
1. **Firebase project** – Enable Email/Password auth and Firestore. The client SDK is initialized in `frontend/src/firebase.js`; update the config there if you change Firebase projects.
2. **Seed users** – Every signup creates a Firestore doc (`users/{uid}`) with `username`, `email`, and `isAdmin`. The UID `v0uqBwBApQVhBTLSaweNTonHnnH2` is whitelisted as the initial admin, but you can add more UIDs to `ADMIN_UIDS` in `firebase.js` or flip the `isAdmin` flag directly in Firestore.
3. **Backend verification** – Set `FIREBASE_SERVICE_ACCOUNT_JSON` so the Express API can verify `Authorization: Bearer <idToken>` headers. All routes require authentication; mutating routes additionally require `isAdmin`.
4. **Handoff** – Grant future developers Owner access in Firebase console and share `.env` files/service-account JSON so they can maintain auth without touching end-user credentials.