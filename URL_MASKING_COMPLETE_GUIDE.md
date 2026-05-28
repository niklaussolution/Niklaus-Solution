# URL Masking - Complete Setup & Troubleshooting Guide

## ✅ Quick Fix Checklist

If masked URLs are not working:
1. **Ensure the masked domain is COMPLETE** (includes https:// AND a TLD like .com)
2. **No truncation** - The domain must show the full URL like `https://go.niklaus.com/r/xxxxx`
3. **Test the link** - Click the Eye icon in the table to test if it works
4. **Check the masked domain** - It should show a green ✓ status banner

---

## 🎯 What URL Masking Does

The URL Masking feature allows you to:
- Hide real URLs behind cryptographic short codes
- Use a custom masked domain (instead of showing your main site's domain)
- Generate unique, trackable links with click counting
- Share public or private (student-specific) links

**Example:**
- Real URL: `https://drive.google.com/file/d/1ABC...XYZ`
- Students see: `https://go.niklaus.com/r/e2f61e84-dd51-30e9...3f2c1f`
- Address bar shows: ✓ `https://go.niklaus.com` (NOT your main domain!)

---

## ⚙️ Configuration (Inside URL Masking Page)

### Step 1: Open Admin Panel → URL Masking
Navigate to the URL Masking section in your admin panel.

### Step 2: Configure Masked Domain
1. Look for the **"URL Masking Configuration"** card at the top
2. Click **"Configure"** button
3. Enter your masked domain:
   - ✓ Correct: `https://go.niklaus.com`
   - ✓ Correct: `https://links.niklaus.com`
   - ✓ Correct: `https://short.example.com`
   - ✗ Incorrect: `https://haihowareyu` (incomplete - missing TLD)
   - ✗ Incorrect: `go.niklaus.com` (missing `https://`)

4. Click **"Save Configuration"**
5. Verify a **green ✓** status appears with "Custom Masked Domain Active"

### Step 3: Create a Test Link
1. Click **"New Masked Link"** button
2. Fill in:
   - **Title:** "Test Link"
   - **Original URL:** `https://google.com` (any valid URL)
   - **Access:** Global (Public)
3. Look at the **"MASKED URL PREVIEW"** box
4. Verify it shows your custom domain: `https://go.niklaus.com/r/example-code-1234`
5. Click **"Generate Masked Link"**

### Step 4: Test the Generated Link
1. In the success message or table, copy the masked URL
2. Open it in a new browser tab
3. Verify the address bar shows: ✓ `https://go.niklaus.com/r/...`
4. The original content should load in an iframe

---

## 🔍 Troubleshooting

### Problem: Masked Domain Shows Red ⚠ Status
**Cause:** Domain is incomplete or not properly configured

**Solutions:**
1. Click **"Configure"** again
2. Verify the domain includes:
   - ✓ `https://` protocol prefix
   - ✓ Complete domain with TLD (e.g., `.com`, `.io`, `.org`)
   - ✗ NOT just `haihowareyu` (this is incomplete)
3. Click **"Save Configuration"** and verify green status appears

---

### Problem: Masked URL Shows Truncated in Table
**Cause:** Long URLs are truncated in the table display for readability

**Solutions:**
1. **Hover over the URL** to see the full URL in a tooltip
2. **Click the copy icon** (📋) - it copies the complete URL
3. **Click the eye icon** (👁️) to test the link in a new tab

---

### Problem: "Site Can't Be Reached" Error
**Cause:** The masked domain doesn't have proper routing set up

**How to Fix (Requires Domain Setup):**

If you're using a **custom domain** like `https://go.niklaus.com`:

1. **Option A: Reverse Proxy (Recommended)**
   - Point your custom domain to your main application's server
   - Configure your web server (Nginx, Apache) to proxy requests:
   ```
   Location /r/* → Forward to your application's /r/* route
   All other requests → Serve your main domain
   ```

2. **Option B: API Redirect**
   - The application provides an API endpoint: `/api/redirect/:shortCode`
   - This endpoint looks up the short code and redirects to the original URL
   - You can use this for external domains

3. **Option C: Use Main Domain Temporarily**
   - While setting up, you can test with your main domain
   - The system will still track clicks and work correctly
   - Upgrade to a custom domain once it's ready

---

### Problem: Click Count Not Increasing
**Cause:** The masked link might not be properly recorded or tracked

**Solutions:**
1. Wait 2-3 seconds after visiting the link
2. Refresh the URL Masking page (F5)
3. Check the "Clicks" column for newer entries
4. Verify the link actually opens the destination

---

### Problem: "Please Configure a Masked Domain First" Error
**Cause:** No masked domain has been set up yet

**Solutions:**
1. Click **"Configure"** button in the "URL Masking Configuration" card
2. Enter a complete domain with protocol: `https://go.niklaus.com`
3. Click **"Save Configuration"**
4. Try creating the masked link again

---

## 🔧 Technical Details

### How It Works

1. **Admin enters a masked domain:**
   - System validates it has https:// and a complete TLD
   - Saves to Firebase: `{ key: "masked_domain_url", value: "https://go.niklaus.com", updatedAt: timestamp }`

2. **When creating a masked link:**
   - System generates a unique UUID short code
   - Creates a Firestore record with the original URL and short code
   - Uses the masked domain to build the URL: `{maskedDomain}/r/{shortCode}`

3. **When student visits the masked link:**
   - Application routes `/r/:code` to LinkRedirect component
   - Component queries Firestore for the short code
   - Finds the original URL and displays it in an iframe
   - Address bar stays masked at `https://go.niklaus.com/r/xxxxx`
   - Click count increments

### Storage Structure (Firestore)

**settings Collection:**
```
Document: masked_domain_url
{
  key: "masked_domain_url",
  value: "https://go.niklaus.com",
  updatedAt: 1711900000000
}
```

**maskedLinks Collection:**
```
Document: (auto-generated)
{
  title: "Test Google Drive",
  description: "Course materials",
  originalUrl: "https://drive.google.com/...",
  shortCode: "e2f61e84-dd51-30e9-bbc8-49fe9b3f2c1f",
  isPublic: true,
  assignedStudents: [],
  createdBy: "admin@gmail.com",
  createdAt: 1711900000000,
  clickCount: 0
}
```

---

## 📋 Best Practices

1. **Use descriptive titles** - Students will see these in their links
2. **Keep masks consistent** - Use the same masked domain for all links
3. **Test before sharing** - Always click the eye icon to verify a link works
4. **Monitor clicks** - Check the click count regularly to see usage
5. **Private links for sensitive content** - Use private access when needed

---

## 🆘 Still Having Issues?

### Debug Checklist:
1. ✓ Is the masked domain status green?
2. ✓ Does the domain include `https://` and a TLD?
3. ✓ Can you copy and view the masked URL?
4. ✓ Does clicking the eye icon open the destination?
5. ✓ Is the custom domain properly set up on your server?

### Get Help:
- Check browser console (F12) for errors
- Verify Firestore has the correct data
- Test with a simple URL first (e.g., https://google.com)
- Ensure your custom domain is reachable

