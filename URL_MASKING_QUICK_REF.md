# URL Masking - Quick Reference Card

## ✅ Green Checkmark Means Working

When you see **✓ Custom Masked Domain Active** in green:
- Domain is properly configured
- Masked links will work
- You can create links

## ⚠️ Red Warning Means Fix Needed

When you see **⚠ Masked Domain Not Configured** in red:
- Domain is missing or incomplete
- Add complete domain: `https://go.niklaus.com`
- Cannot create links until fixed

---

## Domain Format Requirements

| ✓ CORRECT | ✗ INCORRECT |
|-----------|------------|
| `https://go.niklaus.com` | `haihowareyu` |
| `https://links.example.com` | `go.niklaus.com` |
| `https://short.site.io` | `https://haihowareyu` |
| | `ftp://example.com` |
| | `example.com` |

**Remember:** Must have `https://` and complete domain with dot (.com, .io, etc)

---

## 3-Step Setup

```
1. Admin → URL Masking
   ↓
2. Click "Configure" 
   Enter: https://go.niklaus.com
   Click "Save Configuration"
   ↓
3. Look for GREEN ✓ status
   Then create links!
```

---

## Creating a Link

1. Click **"New Masked Link"** button
2. Fill in: Title, Original URL, Access type
3. See **"MASKED URL PREVIEW"** with your domain
4. Click **"Generate Masked Link"**
5. Copy and share!

---

## Testing a Link

**Click Eye Icon 👁️** in the table to test:
- Opens in new tab
- Shows if link works
- Increments click count

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Status is RED ⚠️ | Add complete domain with https:// |
| "Can't reach site" | Domain needs DNS/proxy setup |
| Short codes not unique | System generates them automatically |
| Clicks not counted | Refresh page (F5) after visiting |

---

## URL Format Examples

**Generated Masked URL:**
```
https://go.niklaus.com/r/e2f61e84-dd51-30e9-bbc8-49fe9b3f2c1f
├─ Masked domain (hidden real destination)
├─ /r/ (redirect path)
└─ Unique short code
```

**What students see:**
- Address bar: `https://go.niklaus.com`
- NOT your main site domain!

---

## Admin Settings Note

❌ **NOT** in Settings page anymore  
✅ **NOW** in URL Masking page only

Everything is in one place!

---

## Quick Checklist

- [ ] Masked domain has `https://`
- [ ] Masked domain has complete TLD (`.com`, `.io`, etc)
- [ ] Status shows GREEN ✓
- [ ] Can create test link
- [ ] Can open link in new tab
- [ ] Eye icon opens destination

---

**Need Help?** See: `URL_MASKING_COMPLETE_GUIDE.md`

