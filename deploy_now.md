# 🚀 DEPLOYMENT GUIDE - AccVaults

## ✅ Your Configuration (Verified)

### API Key:
```
[Set in Netlify Environment Variables - DO NOT COMMIT]
```

### Group ID:
```
69090def71dea
```

### Product IDs:
- **8x Server Boost:** `690909b56733b`
- **14x Server Boost:** `690909bb07601`
- **20x Server Boost:** `69090d76c21b6`

✅ All IDs are correctly configured in `js/main.js`

---

## 📦 Step 1: Deploy to Netlify

### A. Drag & Drop:
1. Go to https://app.netlify.com/
2. Log in
3. Find the deploy area (or your existing site)
4. **Drag the ENTIRE `websitepaylix` folder** into Netlify
5. Wait for "Published" with green checkmark ✅

### B. Files to Include:
Make sure these are in your folder:
```
✅ index.html
✅ orders.html
✅ dashboard.html
✅ test-checkout.html
✅ js/main.js
✅ js/paylix-client.js
✅ js/orders.js
✅ js/dashboard.js
✅ netlify/functions/paylix-api.js
✅ netlify/functions/paylix-webhook.js
✅ netlify/functions/create-checkout.js
✅ netlify.toml
✅ package.json
```

---

## 🔑 Step 2: Add Environment Variable

### In Netlify Dashboard:

1. Click your site
2. Go to **"Site settings"**
3. Click **"Environment variables"** (left sidebar)
4. Click **"Add a variable"**
5. Enter:
   - **Key:** `PAYLIX_API_KEY`
   - **Value:** `[Your Paylix API Key from Dashboard]`
6. Click **"Create variable"**

### ⚠️ Important:
- Use EXACTLY `PAYLIX_API_KEY` (case-sensitive)
- Paste the FULL API key (no spaces)
- Click "Save" or "Create"

---

## 🔗 Step 3: Configure Webhook

### Your Webhook URL:
```
https://YOUR-SITE-NAME.netlify.app/.netlify/functions/paylix-webhook
```

### Example (if your site is `cosmic-mandazi-ed0cac`):
```
https://690a753efd1abfad5942e479--cosmic-mandazi-ed0cac.netlify.app/.netlify/functions/paylix-webhook
```

### In Paylix Dashboard:

1. Go to Paylix.gg → Login
2. Settings → Webhooks
3. Click "Add Webhook Endpoint"
4. **Type:** Zapier (leave as is)
5. **Webhook URL:** Paste your full URL above
6. **Events:** Select these:
   - ✅ `order:created`
   - ✅ `order:paid`
   - ✅ `order:paid:product`
   - ✅ `order:cancelled`
   - ✅ `order:cancelled:product`
7. Click **"Add Webhook Endpoint"**

---

## 🧪 Step 4: Test Everything

### A. Test Basic Checkout:
1. Visit: `https://your-site.netlify.app`
2. Click **"Buy Now"** on Server Boosts
3. Should see custom modal with 3 products:
   - 8x Server Boosts - £2.00
   - 14x Server Boosts - £3.00
   - 20x Server Boosts - £4.50
4. Select quantities (use + button)
5. Click **"Proceed to Checkout"**
6. Enter email: `test@example.com`
7. Click **"Complete Payment with Paylix"**
8. Should redirect to Paylix payment page ✅

### B. Test Cart:
1. Click **"Add to Cart"** (cart icon button)
2. Click **cart icon** (top right)
3. Should see "1 Month - Server Boosts" in cart
4. Click **"Proceed to Checkout"**
5. Should open custom checkout
6. Complete payment as above

### C. Test Debug Page:
1. Visit: `https://your-site.netlify.app/test-checkout.html`
2. Click **"Test Paylix API"** → Should show ✅ Loaded
3. Click **"Test Backend"** → Should show ✅ Working
4. Click **"Test Direct Paylix Button"** → Should open Paylix modal

### D. Test Order Tracking:
1. After making a test purchase
2. Visit: `https://your-site.netlify.app/orders.html`
3. Enter your email
4. Click **"Find Orders"**
5. Should see your order ✅

### E. Test Dashboard:
1. Visit: `https://your-site.netlify.app/dashboard.html`
2. Should see stats:
   - Total Orders
   - Total Revenue
   - Products count
   - Recent orders

---

## ❌ Troubleshooting

### Issue: "paylixClient is not defined"
**Fix:**
1. Make sure `js/paylix-client.js` is uploaded
2. Check `index.html` has: `<script src="js/paylix-client.js"></script>`
3. Re-deploy

### Issue: "Failed to create payment"
**Fix:**
1. Check environment variable is set correctly
2. Netlify → Site Settings → Environment Variables
3. Verify `PAYLIX_API_KEY` exists
4. Re-deploy after adding variable

### Issue: Checkout button does nothing
**Fix:**
1. Open browser console (F12)
2. Look for red errors
3. Check if Paylix embed.js loaded (Network tab)
4. Make sure you selected quantities in modal

### Issue: Orders page shows "No orders"
**Fix:**
- This is normal if you haven't made any purchases yet
- Make a test purchase first
- Use the email you purchased with

### Issue: Webhook shows "Failed" in Paylix
**Fix:**
1. Check webhook URL is correct (no typos)
2. Make sure it ends with `/.netlify/functions/paylix-webhook`
3. Verify site is deployed
4. Check Netlify function logs for errors

---

## 🎯 Success Checklist

- [ ] Site deployed to Netlify (green checkmark)
- [ ] Environment variable `PAYLIX_API_KEY` added
- [ ] Webhook configured in Paylix dashboard
- [ ] "Buy Now" opens custom modal
- [ ] Can select quantities
- [ ] Checkout opens and accepts email
- [ ] Redirects to Paylix payment page
- [ ] Cart works
- [ ] Orders page loads
- [ ] Dashboard loads
- [ ] Test page shows all ✅

---

## 📞 If You Need Help

### Check These First:
1. **Browser Console (F12)** → Any red errors?
2. **Netlify Function Logs** → Any errors in paylix-api or paylix-webhook?
3. **Network Tab (F12)** → Are all files loading?

### Send Me:
- Screenshot of console errors
- Screenshot of what happens when you click checkout
- Your Netlify site URL
- Results from test-checkout.html

---

## 🎉 What You'll Have After This:

✅ Custom product selector with quantities
✅ Professional checkout page
✅ Order tracking system
✅ Analytics dashboard
✅ Real-time coupon validation
✅ Fraud prevention (blacklist checking)
✅ Webhook automation
✅ Customer portal
✅ All powered by Paylix API

---

**Deploy now and test! Everything is configured correctly.** 🚀
