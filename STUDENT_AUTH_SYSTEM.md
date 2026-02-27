# Student Login & Signup System - Implementation Guide

## Overview
A complete student authentication system has been implemented for the Niklaus Solution website, allowing students to create accounts, log in, and access their personalized dashboard.

## Features Implemented

### Frontend Components
1. **StudentLogin.tsx** (`src/app/pages/StudentLogin.tsx`)
   - Email and password-based student login
   - Error handling and validation
   - Redirects to student dashboard on successful login
   - Link to signup page for new students

2. **StudentSignup.tsx** (`src/app/pages/StudentSignup.tsx`)
   - Student registration with name, email, phone, and password
   - Password strength validation (minimum 6 characters)
   - Password confirmation matching
   - Automatic login after successful signup
   - Link to login page for existing students

3. **StudentDashboard.tsx** (`src/app/pages/StudentDashboard.tsx`)
   - Protected student dashboard
   - Displays student profile information
   - Shows enrolled workshops count
   - Shows earned certificates count
   - Action buttons to explore workshops and view certificates
   - Logout functionality

4. **StudentProtectedRoute.tsx** (`src/app/components/StudentProtectedRoute.tsx`)
   - Wrapper component for protected student pages
   - Automatically redirects unauthenticated users to login page

### Backend Components
1. **Student Model** (`backend/models/Student.tsx`)
   - Defines the IStudent interface with properties:
     - firebaseUid, name, email, phone
     - enrolledWorkshops, certificates
     - paymentStatus, timestamps

2. **Auth Controller Updates** (`backend/controllers/authController.tsx`)
   - `studentSignup()` - Registers new students
   - `studentLogin()` - Authenticates student login
   - `getStudentProfile()` - Retrieves student profile
   - `updateStudentProfile()` - Updates student information

3. **Auth Routes** (`backend/routes/auth.tsx`)
   - POST `/api/auth/student/signup` - Student registration
   - POST `/api/auth/student/login` - Student login
   - GET `/api/auth/student/profile` - Get profile (protected)
   - PUT `/api/auth/student/profile` - Update profile (protected)

### Context & Providers
1. **StudentContext.tsx** (`src/app/context/StudentContext.tsx`)
   - Global state management for student authentication
   - Methods: `logout()`, `setStudentInfo()`
   - Properties: `studentId`, `studentName`, `token`, `isAuthenticated`

2. **StudentProvider** in `main.tsx`
   - Wraps the application to provide student context
   - Persists student info to localStorage

### Navigation Updates
1. **Updated Navbar** (`src/app/components/Navbar.tsx`)
   - Added "Student Login" button (unauthenticated)
   - Added "Student Signup" button (unauthenticated)
   - Shows personalized greeting with student name (authenticated)
   - Added "Logout" button (authenticated)
   - Mobile-responsive menu updates

2. **Updated Routing** (`src/main.tsx`)
   - Added routes for `/student/login`
   - Added routes for `/student/signup`
   - Added protected route for `/student/dashboard`

## How to Use

### For Students (Frontend)
1. **Sign Up**: Click "Student Signup" in navbar → Fill registration form → Dashboard
2. **Login**: Click "Student Login" in navbar → Enter credentials → Dashboard
3. **Dashboard**: View profile, enrolled workshops, and certificates
4. **Logout**: Click "Logout" button to end session

### For Backend Integration
The student authentication system integrates with Firebase:
- Users are created in Firebase Authentication
- Student data is stored in Firestore under the 'students' collection
- Each student document uses their Firebase UID as the document ID

### API Endpoints

#### Register Student
```bash
POST /api/auth/student/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "student@example.com",
  "phone": "+1234567890",
  "password": "securePassword123"
}
```

#### Login Student
```bash
POST /api/auth/student/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "securePassword123"
}
```

Response:
```json
{
  "message": "Login successful",
  "token": "custom_jwt_token",
  "student": {
    "id": "firebase_uid",
    "name": "John Doe",
    "email": "student@example.com",
    "phone": "+1234567890",
    "enrolledWorkshops": [],
    "certificates": []
  }
}
```

#### Get Student Profile (Protected)
```bash
GET /api/auth/student/profile
Authorization: Bearer <token>
```

#### Update Student Profile (Protected)
```bash
PUT /api/auth/student/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "+1234567890",
  "bio": "Student bio",
  "profileImage": "image_url"
}
```

## Data Storage

### Firestore Collections
- **students** - Stores student profiles
  - Document ID: Firebase UID
  - Fields: name, email, phone, enrolledWorkshops, certificates, paymentStatus, timestamps

## Environment Variables
Ensure these are set in your `.env` file:
- `VITE_API_URL` - Backend API URL (defaults to http://localhost:5000)
- Firebase configuration variables (already set)

## Security Notes
1. Passwords are hashed by Firebase Authentication
2. Student tokens are JWT-based and stored in localStorage
3. Protected routes check for valid tokens before allowing access
4. Password minimum length: 6 characters
5. Consider implementing:
   - Email verification
   - Forgot password functionality
   - Two-factor authentication

## Future Enhancements
1. Email verification on signup
2. Password reset functionality
3. Student profile picture uploads
4. Workshop enrollment workflow
5. Certificate downloads
6. Payment integration for paid workshops
7. Student progress tracking
8. Course progress statistics
9. Discussion forums
10. Student notifications

## Troubleshooting

### Students can't login
- Check if Firebase connection is working
- Verify credentials in `.env`
- Check browser console for error messages

### Protected routes not working
- Ensure StudentProvider is wrapping the app
- Check token in localStorage
- Verify auth middleware in backend

### CORS errors
- Check backend CORS configuration
- Verify API URL in environment variables
