# Running the Application

This project consists of a **Frontend** (React + Vite) and a **Backend** (Express + Firebase).

## Quick Start (Run Both Together)

### Option 1: Run in Separate Terminals (Recommended)

#### Terminal 1 - Frontend:
```bash
npm install
npm run dev
```
This starts the frontend on `http://localhost:5173`

#### Terminal 2 - Backend:
```bash
cd backend
npm install
npm run dev
```
This starts the backend on `http://localhost:5000`

The frontend will automatically proxy API calls to the backend.

---

### Option 2: Run Frontend Only (Development)

```bash
npm install
npm run dev
```

**Note:** Payment features will not work without the backend running.

---

## Environment Setup

### Frontend (.env)
Already configured with Razorpay test credentials:
- `VITE_RAZORPAY_KEY_ID=rzp_test_RvTs4VWeYUMXtm`

### Backend (backend/.env)
Must be configured with:
- `RAZORPAY_KEY_ID=rzp_test_RvTs4VWeYUMXtm`
- `RAZORPAY_SECRET=VrYIlahgCCDKkb0ffkEEHl8K`
- Firebase configuration

---

## API Proxy Configuration

The frontend is configured to proxy all `/api/*` requests to `http://localhost:5000`.

This happens automatically in `vite.config.ts`:
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
},
```

---

## Payment Flow

1. User registers for a workshop
2. Payment form opens (responsive design for all devices)
3. Click "Pay Now" button
4. Frontend calls `/api/payments/create-order` → Backend
5. Backend creates Razorpay order and returns order details
6. Razorpay checkout opens
7. User completes payment
8. Frontend calls `/api/payments/verify` → Backend
9. Backend verifies payment signature
10. Registration saved to Firestore with "completed" status

---

## Troubleshooting

### Backend Server Not Available
If you see "Backend server not available (404)" error:
1. Make sure the backend is running in a separate terminal
2. Verify backend is on `http://localhost:5000`
3. Check that `cd backend && npm install` was run
4. Restart the backend: `npm run dev` in the backend folder

### Port Already in Use
If port 5173 (frontend) or 5000 (backend) is in use:
- Change frontend port in `vite.config.ts`
- Change backend port in `backend/src/server.tsx`

---

## Project Structure

```
Workshop Landing Page Design/
├── src/                          # Frontend React code
│   ├── app/components/
│   │   ├── PaymentForm.tsx        # Payment UI (works with backend)
│   │   ├── WorkshopsSection.tsx   # Workshop registration
│   │   └── ...
│   └── main.tsx
├── backend/                       # Express backend
│   ├── src/
│   │   ├── server.tsx             # Main server file
│   │   ├── controllers/
│   │   │   └── paymentController.ts
│   │   ├── routes/
│   │   │   └── payments.tsx
│   │   └── services/
│   │       ├── razorpayService.ts
│   │       └── ...
│   ├── package.json
│   └── tsconfig.json
├── vite.config.ts                 # Frontend config with API proxy
└── package.json
```

---

## For Production Deployment

- Use Vercel for frontend (includes vercel.json for SPA routing)
- Deploy backend to cloud (AWS, Heroku, etc.)
- Update API proxy target to production backend URL
- Use production Razorpay credentials
