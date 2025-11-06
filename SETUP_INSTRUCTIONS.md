# AccVaults Setup Instructions

## Console Errors Explained

### ✅ Normal Warnings (Can Ignore)
These warnings appear when running locally without full Paylix integration:

1. **"Paylix embed script not loaded"** - Normal when testing locally
2. **"Failed to fetch reviews"** - Normal if API key not configured
3. **"Failed to load categories"** - Normal if API key not configured

### ❌ Real Errors (From Browser Extensions)
These are NOT from your code:
- `client-default-*.js` - Browser extensions (Grammarly, password managers, etc.)
- `Twilio state: invalid` - Twilio browser extensions
- Third-party script errors

**Solution**: Test in incognito mode or disable browser extensions

## Local Development Setup

### 1. Install Dependencies
```bash
npm install -g wrangler
```

### 2. Configure Environment Variables

Edit the `.dev.vars` file and add your Paylix API key:
```
PAYLIX_API_KEY=your_actual_paylix_api_key_here
```

**Where to get your API key:**
1. Go to https://paylix.gg/dashboard
2. Navigate to Settings → API Keys
3. Copy your API key

### 3. Run Local Development Server

```bash
wrangler pages dev . --port 8788
```

Your site will be available at: http://localhost:8788

### 4. Test the Site

**Homepage**: http://localhost:8788/index.html
- Should show products
- Stats should load from Paylix API

**Orders Page**: http://localhost:8788/orders.html
- Enter an email to view orders
- Orders are fetched from Paylix API

**Reviews Page**: http://localhost:8788/reviews.html
- Reviews are fetched from Paylix API

## Deployment

### Deploy to Cloudflare Pages

```bash
wrangler pages deploy . --project-name=accvaults
```

### Set Environment Variables in Cloudflare

1. Go to Cloudflare Dashboard
2. Select your Pages project
3. Go to Settings → Environment Variables
4. Add: `PAYLIX_API_KEY` = your API key

## Troubleshooting

### Issue: "API key not configured"
**Solution**: Make sure `.dev.vars` exists with your API key

### Issue: "Failed to load Paylix"
**Solution**: This is normal for local development. The Paylix embed only works on deployed sites.

### Issue: "No reviews found"
**Solution**: 
1. Check if you have reviews in your Paylix dashboard
2. Verify API key is correct
3. Check browser console for API errors

### Issue: Console shows extension errors
**Solution**: Test in incognito mode to hide extension errors

## File Structure

```
newwebsite123/
├── functions/
│   └── api/
│       ├── paylix-api.js      # Main API handler
│       └── paylix-stats.js    # Stats endpoint
├── js/
│   ├── main.js                # Main JavaScript
│   ├── orders.js              # Orders page logic
│   └── paylix-client.js       # Paylix API client
├── css/
│   └── ...                    # Stylesheets
├── .dev.vars                  # Local environment variables
└── wrangler.toml              # Cloudflare configuration
```

## Support

- **Paylix Documentation**: https://docs.paylix.gg
- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages
- **Discord**: https://discord.gg/accvaults
