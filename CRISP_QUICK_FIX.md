# 🔧 Crisp Chat Quick Fix

## The Problem
Crisp worked on Netlify but not on Cloudflare Pages because **Crisp restricts chat to whitelisted domains only**.

## The Solution (2 Minutes)

### Step 1: Login to Crisp
Go to: https://app.crisp.chat/

### Step 2: Add Your Domain
1. Click on your website
2. Go to **Settings** → **Website Settings** → **Domain & URLs**
3. Click **"Add Domain"**

### Step 3: Add These Domains
```
*.pages.dev
localhost:8788
```

If you have a custom domain, add that too:
```
yourdomain.com
www.yourdomain.com
```

### Step 4: Save & Test
1. Click **Save**
2. Refresh your website
3. Chat widget should appear in bottom-right corner

## How to Check if It's Working

Open browser console (F12) and look for:

✅ **Working:**
```
💬 Loading Crisp chat...
📍 Current domain: your-domain.pages.dev
✅ Crisp chat loaded successfully!
```

❌ **Not Working:**
```
❌ Failed to load Crisp chat script
1. Domain not whitelisted in Crisp dashboard
```

## Still Not Working?

1. **Clear browser cache** (Ctrl + Shift + Delete)
2. **Disable ad blockers** (they often block chat widgets)
3. **Check Crisp dashboard** - make sure domain is saved
4. **Wait 1-2 minutes** after adding domain for changes to propagate

## Your Crisp Website ID
```
99ea6bb5-9995-4cb4-bf3d-298eefa5b4f0
```

This is already configured in your code - you just need to whitelist the domain!
