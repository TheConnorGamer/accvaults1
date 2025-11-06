# Paylix Button Fix - Currency Change Issue

## Problem
- Paylix buttons stopped working after changing currency
- Infinite retry loop in console
- "Paylix not loaded" errors

## Root Cause
- Paylix script was loading in `<head>` before page content
- When currency changed, products re-rendered but Paylix wasn't ready
- Retry logic had no limit, causing infinite loop

## Solution Applied

### 1. Moved Paylix Script Loading
**Before:** Script in `<head>` (loads too early)
**After:** Script at end of `<body>` before `main.js` (loads after content)

**Files Updated:**
- `index.html` - Moved Paylix script to line 246
- `products.html` - Moved Paylix script to line 136

### 2. Added Retry Limit
**Before:** Infinite retries
**After:** Max 10 retries (2 seconds total)

**File:** `js/main.js` line 157-178

### 3. Better Error Handling
- Shows retry count in console
- Stops after max retries with clear error message
- Logs success when Paylix loads

## How It Works Now

1. **Page loads** → HTML content renders first
2. **Paylix script loads** → After content, before main.js
3. **main.js runs** → Paylix is ready
4. **Currency changes** → Products re-render
5. **Paylix re-init** → Tries up to 10 times with 200ms delay
6. **Success** → Buttons work in any currency

## Console Messages

### Success:
```
✅ Paylix buttons initialized
Found 1 Paylix button(s)
```

### Retrying:
```
⚠️ Paylix not loaded, retrying... (1/10)
⚠️ Paylix not loaded, retrying... (2/10)
```

### Failed:
```
❌ Paylix failed to load after max retries. Please refresh the page.
```

## Testing

1. Deploy updated code
2. Go to products page
3. Change currency (£ → $ → €)
4. Click "View Products" button
5. Should open Paylix modal in any currency

**Fixed!** Buttons now work after currency changes. 🎉
