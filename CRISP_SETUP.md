# Crisp Chat Setup Instructions

## ✅ Your Crisp ID is Already Configured!
Website ID: `99ea6bb5-9995-4cb4-bf3d-298eefa5b4f0`

## ⚠️ Domain Whitelist Issue (IMPORTANT!)

Crisp chat only works on **whitelisted domains**. If it worked on Netlify but not on Cloudflare Pages, you need to add your new domain.

### Fix: Add Domains to Crisp Dashboard

1. **Go to Crisp Dashboard:**
   - Visit: https://app.crisp.chat/
   - Login to your account

2. **Navigate to Domain Settings:**
   - Select your website
   - Go to **Settings** → **Website Settings** → **Domain & URLs**

3. **Add These Domains to Whitelist:**
   ```
   localhost:8788
   127.0.0.1:8788
   *.pages.dev
   accvaults.pages.dev
   your-actual-domain.pages.dev
   ```

4. **For Custom Domains:**
   If you have a custom domain, add:
   ```
   yourdomain.com
   www.yourdomain.com
   ```

### Check if Crisp is Loading

Open browser console and look for:
- ✅ `Crisp chat loaded successfully!` - Working
- ❌ `Failed to load Crisp chat` - Domain not whitelisted

### Common Issues

**Issue**: Chat widget doesn't appear
**Solution**: 
1. Check if domain is whitelisted in Crisp dashboard
2. Clear browser cache
3. Check console for errors

**Issue**: Works on Netlify but not Cloudflare
**Solution**: Add your Cloudflare Pages domain to Crisp whitelist

**Issue**: Works on production but not localhost
**Solution**: Add `localhost:8788` to Crisp whitelist

## The Code is Already Added!

The Crisp chat script is in:
- `index.html` (inline script)
- `js/crisp-chat.js` (for other pages)

All pages include the Crisp chat integration. You just need to whitelist your domains!
