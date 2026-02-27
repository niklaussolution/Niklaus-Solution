# Local Development Setup Guide

## Payment System Setup

The payment system requires both frontend and backend servers to run together. Follow these steps:

### Step 1: Create Backend Environment File

Create a `.env` file in the `backend/` directory:

```bash
cd backend
```

Create `.env` file with your Razorpay credentials:

```
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_SECRET_KEY=your_razorpay_secret_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Start Backend Server (Port 5000)

```bash
cd backend
npm run dev
```

The backend server will run on `http://localhost:5000`

### Step 4: Start Frontend Server (Port 5173)

In a new terminal:

```bash
cd path/to/root
npm run dev
```

The frontend will run on `http://localhost:5173`

### Step 5: Test Payment Flow

1. Open `http://localhost:5173` in your browser
2. Register for a workshop
3. When you proceed to payment, the frontend will:
   - Call `http://localhost:5173/api/payments/create-order` (proxied to `http://localhost:5000/api/payments/create-order`)
   - Receive order details from backend
   - Open Razorpay checkout

### Troubleshooting

**Error: "POST http://localhost:5173/api/payments/create-order 500"**
- Check if backend server is running on port 5000
- Verify environment variables are set correctly in backend/.env
- Check backend console for detailed error messages

**Error: "RAZORPAY_KEY_ID environment variable is not set"**
- Make sure backend/.env file exists in the backend folder
- Add your Razorpay credentials to the .env file
- Restart backend server after updating .env

**Connection Refused**
- Backend server is not running
- Run `npm run dev` in the backend folder
- Verify it's listening on port 5000

### How Vite Proxy Works

The frontend Vite dev server is configured to proxy API calls:
- Request: `POST http://localhost:5173/api/payments/create-order`
- Proxied to: `POST http://localhost:5000/api/payments/create-order`
- Backend handles the request and returns Razorpay order details

### Port Configuration

- **Frontend**: `http://localhost:5173` (Vite dev server)
- **Backend**: `http://localhost:5000` (Express.js server)
- **Proxy**: Vite forwards `/api/*` to backend

### Production Deployment

For production (Vercel):
- Frontend API calls will use the Vercel serverless functions in `/api` folder
- No backend server needed (Firebase Admin SDK handles it)
