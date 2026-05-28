# Student Registration & Login System - Complete Implementation Guide

## System Overview

This is a complete sync between the Admin Panel, Firebase Auth, Firestore, and Student Dashboard to support:
1. **Regular student signup** - Students sign up, need admin approval
2. **Manual admin registration** - Admin directly registers students, they can log in immediately

---

## Data Flow Architecture

### Firebase Collections Used:
- **`students`** - Student profiles (created by signup or admin)
- **`registrations`** - Course registrations/enrollments 
- **`workshops`** - Available courses
- **`loginRequests`** - Pending login approvals (only for regular signups)
- **`workshop_videos`** - Course videos for each workshop

---

## Complete Flow for Each Scenario

### Scenario 1: Student Self-Signup (Requires Admin Approval)

**Step 1: Frontend - StudentSignup.tsx**
- User creates account with email/password
- Creates Firebase Auth user
- Creates student Firestore doc with structure:
  ```
  students/{uid}
  - firebaseUid: uid
  - name: string
  - email: string
  - phone: string
  - enrolledWorkshops: []  // Empty initially
  - certificates: []
  ```

**Step 2: Frontend - StudentLogin.tsx**
- User logs in with email/password
- Authenticates with Firebase Auth
- Gets Firebase user UID
- Fetches student doc from Firestore
- **Checks if `manuallyRegistered === true`**:
  - If YES: Bypasses approval → Direct to dashboard
  - If NO: Creates loginRequest doc → Waits for approval

**Step 3: Admin - LoginRequestsManagement.tsx**
- Admin can approve/reject login requests
- On approve: Updates loginRequest doc with `approved: true`

**Step 4: Frontend - WaitingForApproval.tsx**
- Student waits for approval via Firestore listener
- On approval detected: Calls `setStudentInfo()` to update StudentContext
- Redirects to `/student/dashboard`

**Step 5: Frontend - StudentDashboard.tsx**
- Loads student profile with `enrolledWorkshops` array
- Fetches videos for each workshop in that array

---

### Scenario 2: Admin Manual Registration (No Approval Needed)

**Step 1: Admin - RegistrationsManagement.tsx**
- Admin clicks "Add Registration"
- Fills form with: name, email, phone, organization, workshop

**Step 2: API Endpoint - `/api/auth/student/create-admin-account`**
- Called by admin panel
- Creates Firebase Auth user with:
  - Email: from form
  - Password: temporary random password
  - Display Name: from form
- Creates student Firestore doc with:
  ```
  students/{uid}
  - firebaseUid: uid
  - name: from form
  - email: from form
  - phone: from form
  - organization: from form
  - enrolledWorkshops: [workshopTitle]  // Pre-filled!
  - certificates: []
  - manuallyRegistered: true  // KEY FLAG!
  - tempPasswordSet: true
  ```
- Returns temp password to admin

**Step 3: Admin Panel**
- Shows success message with temp password
- Admin provides password to student

**Step 4: Frontend - RegistrationsManagement.tsx**
- Also creates registration doc in `registrations` collection:
  ```
  registrations/{autoId}
  - studentId: uid
  - userName: string
  - email: string
  - phone: string
  - workshopId: string
  - workshopTitle: string
  - amount: number
  - status: "Confirmed"
  - paymentStatus: "Completed"
  ```

**Step 5: Frontend - StudentLogin.tsx**
- Student logs in with email + temp password
- Authenticates with Firebase Auth
- Gets student doc from Firestore
- **Detects `manuallyRegistered === true`**
- **SKIPS loginRequest/approval process**
- Calls `setStudentInfo()` immediately
- Redirects directly to `/student/dashboard`

**Step 6: Frontend - StudentDashboard.tsx**
- Loads student profile
- `enrolledWorkshops` is already populated!
- Fetches all videos for enrolled workshops
- Student can see all course materials immediately

---

## Firestore Query Relationships

### When StudentDashboard Loads:

1. **Load Student Document**
   ```
   students/{studentId}
   → Gets: enrolledWorkshops, name, email, etc.
   ```

2. **Load Registrations for Student**
   ```
   registrations where studentId == {studentId}
   → Gets: amount, paymentStatus, workshopTitle
   ```

3. **For Each enrolledWorkshop, Find Workshop Doc**
   ```
   workshops where title == workshopTitle
   → Gets: workshopId
   ```

4. **Load Videos for Workshop**
   ```
   workshop_videos where workshopId == {workshopId}
   → Gets: video list for course
   ```

---

## Data Integrity Checks

### ✅ Everything Syncs Because:

1. **Manual Registration creates both docs:**
   - ✓ `students` doc with `enrolledWorkshops`
   - ✓ `registrations` doc with `studentId`

2. **Student doc has all needed fields:**
   - ✓ Firebase UID as doc ID
   - ✓ `enrolledWorkshops` array (populated by admin)
   - ✓ `manuallyRegistered` flag (skips approval)

3. **Registration doc links student to workshop:**
   - ✓ `studentId` field for querying
   - ✓ `workshopTitle` field for display
   - ✓ `amount` and `paymentStatus` for billing

4. **Login flow checks registration status:**
   - ✓ Regular signup: needs approval
   - ✓ Manual registration: immediate access

---

## Login Flow Decision Tree

```
Student attempts login
    ↓
Firebase Auth succeeds → Get user UID
    ↓
Fetch students/{uid}
    ↓
    ├─ Document not found?
    │  └─ Error: "Student account not found"
    │
    └─ Document found?
       ↓
       Check manuallyRegistered flag?
       │
       ├─ true?
       │  └─ setStudentInfo() → /student/dashboard (IMMEDIATE)
       │
       └─ false/missing?
          └─ Create loginRequest → /student/waiting-approval
             ├─ Wait for admin approval
             ├─ Admin updates loginRequest.approved = true
             └─ setStudentInfo() → /student/dashboard
```

---

## Troubleshooting Checklist

### If manually registered student doesn't see courses:

- [ ] Check `students` doc exists with that email
- [ ] Check `enrolledWorkshops` array is populated
- [ ] Check `registrations` doc exists with same studentId
- [ ] Check `workshops` doc exists with matching title
- [ ] Check `workshop_videos` docs exist for those workshopIds
- [ ] Student may need to refresh page (localStorage might be stale)

### If manually registered student can't log in:

- [ ] Check Firebase Auth user was created with that email
- [ ] Check temporary password was provided to student
- [ ] Check student is using temporary password (not their own)
- [ ] Check `students` doc wasn't deleted between signup and login

### If manually registered student gets stuck on approval screen:

- [ ] Check `manuallyRegistered` field in student doc
- [ ] Should be `true` for manual registrations
- [ ] If not set, student gets stuck waiting for approval

---

## Summary of Changes

### New Files:
- [api/auth/student/create-admin-account.ts](api/auth/student/create-admin-account.ts) - API for admin account creation

### Modified Files:
- [src/admin/pages/RegistrationsManagement.tsx](src/admin/pages/RegistrationsManagement.tsx) - Calls API to create accounts
- [src/app/pages/StudentLogin.tsx](src/app/pages/StudentLogin.tsx) - Checks `manuallyRegistered` flag
- [src/app/pages/WaitingForApproval.tsx](src/app/pages/WaitingForApproval.tsx) - Updates StudentContext properly

---

## Testing Steps

### For Manual Registration:
1. Go to Admin → Registrations
2. Click "Add Registration"
3. Fill form with email, name, phone, workshop
4. Click Add
5. Copy temporary password from success message
6. Have student log in with that email + temp password
7. Student should see enrolled course immediately

### For Regular Signup:
1. Go to Student Login page
2. Click "Sign up here"
3. Create account with email/password
4. Redirects to login
5. Log in with that email/password
6. Goes to "Waiting for Approval" screen
7. Admin approves in LoginRequests
8. Redirected to dashboard
9. (Student still has no courses until admin registers them in another workshop)

