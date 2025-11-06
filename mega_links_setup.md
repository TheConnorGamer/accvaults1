# Downloads Page - Mega Links Setup Guide

## Where to Add Your Mega Links

Open `downloads.html` and find these lines. Replace `YOUR_MEGA_LINK_X` with your actual Mega.nz links:

### Button 1: B04/NZ | Scorpion External
**Line 191:** `href="YOUR_MEGA_LINK_1"`
Replace with: `href="https://mega.nz/file/YOUR_ACTUAL_LINK"`

### Button 2: B04/NZ | Blitz External
**Line 194:** `href="YOUR_MEGA_LINK_2"`

### Button 3: B04/NZ | Blitz Internal
**Line 201:** `href="YOUR_MEGA_LINK_3"`

### Button 4: B04/NZ | Zenith V2
**Line 204:** `href="YOUR_MEGA_LINK_4"`

### Button 5: MW3 | Ultimate Chair
**Line 211:** `href="YOUR_MEGA_LINK_5"`

### Button 6: MW19 | Scorpz Chair
**Line 214:** `href="YOUR_MEGA_LINK_6"`

### Button 7: MW19 | Unlock All
**Line 221:** `href="YOUR_MEGA_LINK_7"`

### Button 8: MW19 | All Software Loader
**Line 224:** `href="YOUR_MEGA_LINK_8"`

### Button 9: CS2 | Scorpion External Chair
**Line 231:** `href="YOUR_MEGA_LINK_9"`

### Button 10: CS2 | ZeroMercy External
**Line 234:** `href="YOUR_MEGA_LINK_10"`

### Button 11: CS2 | All Externals loader
**Line 241:** `href="YOUR_MEGA_LINK_11"`

---

## Example:

**Before:**
```html
<a href="YOUR_MEGA_LINK_1" target="_blank" class="download-mega-btn">
```

**After:**
```html
<a href="https://mega.nz/file/abc123xyz" target="_blank" class="download-mega-btn">
```

---

## Features:
✅ All buttons open in new tab (`target="_blank"`)
✅ Purple gradient styling matching your brand
✅ Hover effects with shadow
✅ Download icon on each button
✅ Responsive design for mobile
✅ Large "AV" logo on the right side

---

## To Add More Buttons:

Copy this template and paste it in the appropriate row:

```html
<a href="YOUR_MEGA_LINK" target="_blank" class="download-mega-btn">
    <i class="fas fa-download"></i> Your Button Text Here
</a>
```
