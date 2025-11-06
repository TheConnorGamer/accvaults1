# Paylix Cart Checkout - Deployment Instructions

## Setup Steps

### 1. Add Environment Variable to Netlify

1. Go to your Netlify dashboard
2. Select your site (accvaults)
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable**
5. Add:
   - **Key:** `PAYLIX_API_KEY`
   - **Value:** `EzxWYoBzSAECBsJojXHrAOJQbBD4SEHdPJNS7b6mu418C96uVb2RQiP8ALzj5CzA`
6. Click **Save**

### 2. Deploy to Netlify

Option A: **Git Push** (if using Git)
```bash
git add .
git commit -m "Add Paylix cart checkout integration"
git push
```

Option B: **Netlify CLI**
```bash
netlify deploy --prod
```

Option C: **Drag & Drop**
- Zip your project folder
- Drag to Netlify dashboard

### 3. Test the Checkout

1. Visit your site
2. Add items to cart
3. Click "Proceed to Checkout"
4. Enter email and optional coupon
5. You'll be redirected to Paylix's checkout page with all items!

## How It Works

1. User adds items to cart
2. Clicks "Proceed to Checkout"
3. Frontend calls Netlify Function at `/.netlify/functions/create-checkout`
4. Function securely calls Paylix API with your API key
5. Paylix returns a checkout URL
6. User is redirected to Paylix's full checkout page
7. User completes payment on Paylix
8. User is redirected back to your site

## Features

✅ Multiple items in one checkout
✅ Coupon code support
✅ Secure API key handling (server-side only)
✅ Full Paylix checkout experience
✅ Professional e-commerce flow

## Troubleshooting

**Error: "Failed to create checkout"**
- Check that environment variable is set correctly in Netlify
- Verify API key is valid in Paylix dashboard

**Function not found**
- Make sure you deployed after adding the function
- Check `netlify.toml` has `functions = "netlify/functions"`

**CORS errors**
- The function includes CORS headers, should work automatically
