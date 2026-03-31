# Masked Domain URL Settings - New Collection Implementation

## Overview
Masked domain URL settings are now stored in a **dedicated Firestore collection** called `urlMaskingSettings` instead of being mixed with other settings in the generic `settings` collection.

## Changes Made

### 1. New Service File: `maskedDomainService.ts`
**Location:** `src/admin/services/maskedDomainService.ts`

This service provides all operations for masked domain URL management:

```typescript
// Save masked domain settings with automatic updates
await saveMaskedDomainSettings(url: string, updatedBy?: string)

// Get current masked domain settings
const settings = await getMaskedDomainSettings()

// Get masked domain URL only (convenience function)
const url = await getMaskedDomainUrl()

// Validate and save in one operation
const result = await validateAndSaveMaskedDomain(url: string, updatedBy?: string)

// Get settings history/audit trail
const history = await getMaskedDomainSettingsHistory(limit: number)
```

### 2. Updated: `LinkManagement.tsx`
**Changes:**
- Now imports from `maskedDomainService` instead of direct Firestore calls
- Uses `getMaskedDomainSettings()` to load the URL
- Uses `validateAndSaveMaskedDomain()` to save updates
- Firestore queries simplified (removed `settingsSnap` dependency)

### 3. Firestore Collections

#### New Collection: `urlMaskingSettings`
```
Collection: urlMaskingSettings
  Document: current
    {
      url: "https://go.niklaus.com",
      isActive: true,
      description: "Masked domain: https://go.niklaus.com",
      createdAt: Timestamp,
      updatedAt: Timestamp,
      updatedBy: "admin@email.com"
    }
```

**Features:**
- ✅ Dedicated collection for URL masking settings
- ✅ Automatic timestamps (createdAt, updatedAt)
- ✅ Audit trail (tracks who updated it)
- ✅ Active/inactive status support
- ✅ Clear structure and purpose

#### Backward Compatibility: `settings` Collection
For now, the system writes to BOTH collections:
- Primary: `urlMaskingSettings` (new)
- Fallback: `settings/masked_domain_url` (legacy)

This allows gradual migration without breaking existing functionality.

## How to Use

### From Admin UI (LinkManagement page):
1. Click "Edit" next to URL Masking Configuration
2. Enter the masked domain URL (e.g., `https://go.niklaus.com`)
3. Click "Save"
4. ✅ Settings are automatically saved to `urlMaskingSettings` collection
5. ✅ Updated timestamp and admin email are recorded

### From Code:
```typescript
import { getMaskedDomainUrl, validateAndSaveMaskedDomain } from '../services/maskedDomainService';

// Get current URL
const maskedUrl = await getMaskedDomainUrl();

// Save new URL
const result = await validateAndSaveMaskedDomain('https://go.niklaus.com', adminEmail);
if (result.isValid) {
  console.log('✓ Saved:', result.data?.url);
} else {
  console.error('✗ Error:', result.error);
}
```

## Automatic Updates

When the masked domain URL is changed:

1. **Service saves to new collection:**
   - `urlMaskingSettings/current` document is updated
   - Timestamps (`createdAt`, `updatedAt`) are auto-managed
   - `updatedBy` field records who made the change

2. **Backward compatibility maintained:**
   - `settings/masked_domain_url` is also updated (temporary)

3. **Admin UI updates immediately:**
   - Success message displayed
   - Form is cleared and closes
   - Masked links use the new domain for future URLs

4. **Existing masked links:**
   - Continue to work with their original domains
   - No migration needed - redirection still works

## Audit Trail

To view all changes to the masked domain URL:

```typescript
import { getMaskedDomainSettingsHistory } from '../src/admin/services/maskedDomainService';

const history = await getMaskedDomainSettingsHistory(10);
history.forEach(entry => {
  console.log(`Updated by: ${entry.updatedBy} at ${entry.updatedAt}`);
  console.log(`URL: ${entry.url}`);
});
```

## Migration From Old System

The old system stored masked domain in the generic `settings` collection. The new system:

1. Uses dedicated `urlMaskingSettings` collection ✅
2. Maintains backward compatibility (writes to both) ✅
3. Can be gradually migrated by updating code that reads settings ✅

**To fully migrate existing code:**

Old way (still works):
```typescript
const settingsDocs = await getDocs(collection(db, 'settings'));
const maskedDomain = settingsDocs.docs.find(d => d.data().key === 'masked_domain_url');
```

New way (recommended):
```typescript
const settings = await getMaskedDomainSettings();
const url = settings?.url;
```

## Benefits

✅ **Better Organization:** Dedicated collection for URL masking config  
✅ **Automatic Updates:** Always records who changed it and when  
✅ **Cleaner Code:** Service handles all validation and Firestore logic  
✅ **Audit Trail:** Full history of changes available  
✅ **Backward Compatible:** Existing code continues to work  
✅ **Type Safe:** TypeScript interfaces for settings data  
✅ **Scalable:** Easy to add more masking configuration options later  

## Files Modified

1. **Created:**
   - `src/admin/services/maskedDomainService.ts`

2. **Updated:**
   - `src/admin/pages/LinkManagement.tsx`
     - Added import for service functions
     - Updated `handleSaveMaskedDomain()` to use service
     - Updated `fetchData()` to load from new collection

## Notes

- The old `validateAndNormalizeUrl()` function in LinkManagement.tsx is still present but not used (can be removed in future cleanup)
- Firestore rules should allow read/write to `urlMaskingSettings` collection for authenticated admins
- The service automatically handles URL normalization and validation

## Troubleshooting

**Q: Settings not loading?**
- Check Firestore for `urlMaskingSettings/current` document
- Verify Firestore rules allow reads
- Check browser console for errors

**Q: Updates not saving?**
- Verify Firestore rules allow writes to `urlMaskingSettings`
- Check that user is authenticated as admin
- Look for error messages in browser console

**Q: Need to reset settings?**
- Delete the `urlMaskingSettings/current` document from Firestore
- Refresh the admin page and save again
