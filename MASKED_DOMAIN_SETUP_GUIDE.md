# Masked Domain URL Setup & Troubleshooting Guide

## 🎯 What This Feature Does

The **URL Masking** system allows you to:
1. Hide real URLs behind cryptographic short codes
2. Use a **custom masked domain** (instead of showing your main domain)
3. Completely anonymize links so students see a different domain in their address bar

Example:
- **Real URL:** `https://drive.google.com/file/d/1ABC...`
- **Masked Link:** `https://go.niklaus.com/r/e2f61e84-dd51-30e9-bbc8-49fe9b3f2c1f`
- **What students see:** ✅ Only the masked domain (`https://go.niklaus.com`), NOT your main domain

---

## ✅ Complete Setup Checklist

### Step 1: Configure Masked Domain URL in Settings (Critical!)
1. Go to **Admin Panel → Settings**
2. Find the **"URL Masking Settings"** section
3. Enter your masked domain: `https://go.niklaus.com` (or your configured domain)
4. Click **"Save Settings"** (green button)
5. You should see a success message: **"Settings updated successfully!"**

### Step 2: Verify Settings Were Saved to Firestore
1. Open Browser DevTools: **F12** or **Right-click → Inspect**
2. Go to the **Console** tab
3. You should see logs like:
   ```
   Submitting settings: { whatsapp_phone: '91...', masked_domain_url: 'https://go.niklaus.com', ... }
   Settings update response: { success: true }
   Fetched settings: { whatsapp_phone: '91...', masked_domain_url: 'https://go.niklaus.com', ... }
   ```

### Step 3: Reload the URL Masking Page
1. Go to **Admin Panel → URL Masking**
2. Open Browser Console (**F12 → Console tab**)
3. You should see logs showing:
   ```
   📋 Settings docs found: 3
     - whatsapp_phone: 919999999999
     - whatsapp_message: Hi! I'm interested...
     - masked_domain_url: https://go.niklaus.com
   ✓ Masked domain loaded from settings: https://go.niklaus.com
   ```

### Step 4: Create a Test Masked Link
1. Click **"New Masked Link"** button
2. Fill in:
   - **Title:** "Test Google Drive"
   - **Original URL:** `https://drive.google.com` or any URL
   - **Access:** Global (public)
3. Look at the **"MASKED URL PREVIEW"** box at the top-right
4. It should show: `https://go.niklaus.com/r/example-code-1234`
5. Click **"Generate Masked Link"**
6. In the success message, verify the masked link starts with your custom domain

### Step 5: Test the Masked Link
1. Copy the masked link from the success message or table
2. Open it in a new browser tab
3. Verify in the address bar it shows: `https://go.niklaus.com/r/...` (NOT `https://www.theniklaus.com`)
4. The content should load in an iframe (your original destination)

---

## 🔍 Troubleshooting: If Masked URLs Still Show Main Domain

### Problem: Masked links still show `https://www.theniklaus.com/r/...` instead of custom domain

#### Check 1: Verify Settings Were Saved
```
1. Go to Settings page
2. Open Console (F12)
3. You should see "Settings updated successfully!" message
4. If you don't see this, the settings weren't saved
```

#### Check 2: Verify Settings Are Loading in URL Masking Page
```
1. Go to URL Masking page
2. Open Console (F12)
3. Look for logs with "📋 Settings docs found"
4. If you see "⚠ No masked_domain_url setting found" → settings not in Firestore
5. If you see "✓ Masked domain loaded" → settings loaded correctly
```

#### Check 3: Verify Firestore Settings Structure
1. Go to **Firebase Console → Firestore Database**
2. Check the **`settings`** collection
3. You should see individual documents like:
   ```
   Document ID: whatsapp_phone
   Content: { key: "whatsapp_phone", value: "919...", ... }
   
   Document ID: masked_domain_url
   Content: { key: "masked_domain_url", value: "https://go.niklaus.com", ... }
   ```
4. If `masked_domain_url` document doesn't exist, go to Settings and save again

#### Check 4: Browser Cache
- The admin panel might be showing cached state
- **Solution:** Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Or clear cache: DevTools → Application → Clear storage

---

## 🔧 Technical Details

### How It Works Internally

1. **Settings Saving Flow:**
   - Admin enters domain in Settings page
   - Clicks "Save Settings"
   - API calls `updateSettings()` which saves to Firestore as: `{ key: "masked_domain_url", value: "https://go.niklaus.com", updatedAt: timestamp }`

2. **Masked Link Creation Flow:**
   - Admin goes to URL Masking page
   - `fetchData()` is called on component mount
   - Queries Firestore `settings` collection
   - Finds document where `key === "masked_domain_url"`
   - Extracts the `.value` field
   - Sets React state: `maskedDomain = "https://go.niklaus.com"`
   - When form is submitted, uses this domain to build masked URL: `{maskedDomain}/r/{shortCode}`

3. **Link Redirect Flow:**
   - Student visits: `https://go.niklaus.com/r/e2f61e84-dd51-30e9-bbc8-49fe9b3f2c1f`
   - Route `/r/:code` redirects to `LinkRedirect.tsx`
   - Looks up record in Firestore `maskedLinks` by `shortCode`
   - Renders original URL in hidden iframe
   - Address bar stays masked at `https://go.niklaus.com/r/...`

### Firestore Collections

**`settings` Collection:**
```
{
  key: "whatsapp_phone",
  value: "919999999999",
  createdAt: 1234567890,
  updatedAt: 1234567890
}

{
  key: "whatsapp_message",
  value: "Hi! I'm interested...",
  createdAt: 1234567890,
  updatedAt: 1234567890
}

{
  key: "masked_domain_url",
  value: "https://go.niklaus.com",
  createdAt: 1234567890,
  updatedAt: 1234567890
}
```

**`maskedLinks` Collection:**
```
{
  title: "Test Google Drive",
  description: "",
  originalUrl: "https://drive.google.com",
  shortCode: "e2f61e84-dd51-30e9-bbc8-49fe9b3f2c1f",
  isPublic: true,
  assignedStudents: [],
  createdBy: "admin@example.com",
  createdAt: 1234567890,
  clickCount: 5
}
```

---

## 📋 Admin Panel Console Logs

When working with URL Masking, you'll see these helpful console logs:

### On Settings Update:
```
Submitting settings: { masked_domain_url: 'https://go.niklaus.com', ... }
Settings update response: { /* success response */ }
Fetched settings: { masked_domain_url: 'https://go.niklaus.com', ... }
```

### On URL Masking Page Load:
```
📋 Settings docs found: 3
  - whatsapp_phone: 919999999999
  - whatsapp_message: Hi! I'm interested...
  - masked_domain_url: https://go.niklaus.com
✓ Masked domain loaded from settings: https://go.niklaus.com
```

### If Something's Wrong:
```
⚠ No masked_domain_url setting found in Firestore. Using default: https://www.theniklaus.com
⚠ No settings found in Firestore
```

---

## 🚀 Testing Checklist

- [ ] Settings page shows correct masked domain
- [ ] Console shows "✓ Masked domain loaded from settings"
- [ ] Masked URL preview shows custom domain (not main domain)
- [ ] Generated masked links start with custom domain
- [ ] Clicking masked link works and renders original content
- [ ] Address bar stays masked throughout browsing
- [ ] Students see masked domain in their downloads/links

---

## ❓ Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Masked domain not loading | 1. Check Settings page was saved (look for success message) <br> 2. Reload URL Masking page with `Ctrl+Shift+R` <br> 3. Check Firestore for `masked_domain_url` document |
| Blank preview showing | Likely CSS/rendering issue. Try hard refresh: `Ctrl+Shift+R` |
| Clicking masked link shows error | 1. Check Firestore access rules allow reading `maskedLinks` <br> 2. Verify original URL is valid and accessible |
| StudentDashboard not showing downloads | Check `sharedFiles` collection has documents with `isPublic: true` |

---

## 📞 Need Help?

Check the console logs (F12 → Console) for detailed error messages. Most issues are resolved by:
1. Saving settings again
2. Hard refreshing the page (`Ctrl+Shift+R`)
3. Checking browser console for specific error messages
