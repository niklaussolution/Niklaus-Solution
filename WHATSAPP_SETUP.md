# How to Change WhatsApp Button Number

## Quick Steps

### 1. Go to Admin Panel
- Login at: `https://theniklaus.com/admin/login`
- Or: `https://yourserver.com/admin/login`

### 2. Look for **Settings** in Sidebar
- Sidebar on left side
- Look for icon: **⚙️ Settings**
- If you don't see it, check you're logged in

### 3. Click Settings
- Page will load with form fields

### 4. Find WhatsApp Section
- Scroll down to find: **"WhatsApp Button Settings"**
- Two fields:
  - **WhatsApp Phone Number** ← Change this
  - **WhatsApp Message** (optional)

### 5. Enter Phone Number
- Format: Country code + number
- Examples:
  - India: `919876543210` (91 = India, 9876543210 = number)
  - USA: `11234567890` (1 = USA, 2345678901 = number)
  - UK: `441234567890` (44 = UK, 1234567890 = number)

### 6. Click Save Settings
- Button is at bottom of form
- Shows "Saving..." while processing
- Will show success message

### 7. Done!
- WhatsApp button on homepage will use new number
- Auto-updates within 5 seconds

---

## What Changed Recently

✅ **Settings now visible for:**
- super_admin users
- editor users

✅ **WhatsApp button updates automatically** every 5 seconds after save

✅ **Better error messages** if something goes wrong

---

## Troubleshooting

### I don't see Settings in Sidebar
**Reason:** Your user role doesn't allow it
- **Solution:** Contact admin to change your role to "editor" or "super_admin"
- Check navbar text - shows your current role

### Settings won't save
**Reason:** Could be Firebase permission issue
- **Solution:** 
  1. Check browser console (F12 > Console)
  2. Look for error messages
  3. Try logging out and back in
  4. Contact admin if still broken

### WhatsApp number still old
**Reason:** Browser cached old number
- **Solution:**
  1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
  2. Wait 5 seconds after saving
  3. Clear browser cache and reload

### Phone number format wrong
**Wrong formats:**
- ❌ +919876543210 (don't use +)
- ❌ 00919876543210 (don't use 00)
- ❌ +91 9876543210 (don't use spaces)

**Correct format:**
- ✅ 919876543210 (just digits)
- ✅ 11234567890 (just digits)

---

## Testing WhatsApp Button

After saving:
1. Go to homepage: `https://theniklaus.com`
2. Scroll to bottom-right corner
3. Look for green **WhatsApp button**
4. Click it
5. Should open WhatsApp with your new number
6. Message will be pre-filled

---

## Where is WhatsApp Number Stored?

Saved in: **Firestore Database**
- Collection: `settings`
- Document: `whatsapp_phone`
- Value: Your phone number

Used by: **WhatsAppButton.tsx component**
- Located: `src/app/components/WhatsAppButton.tsx`
- Refreshes: Every 5 seconds

---

**That's it! You can now easily change the WhatsApp number from Settings!** 🎉
