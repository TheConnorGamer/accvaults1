# Cloudflare Pages Deployment Guide

## Quick Deploy

1. **Connect Your Repository**
   - Go to [Cloudflare Pages](https://pages.cloudflare.com/)
   - Click "Create a project"
   - Connect your Git repository (GitHub, GitLab, etc.)

2. **Configure Build Settings**
   - **Framework preset**: None (or select if using a framework)
   - **Build command**: (leave empty for static sites)
   - **Build output directory**: `/` (root directory)
   - **Root directory**: `/` (or specify if your site is in a subdirectory)

3. **Set Environment Variables**
   Add the following environment variable in the Cloudflare Pages dashboard:
   - `PAYLIX_API_KEY`: Your Paylix API key
   
   To add environment variables:
   - Go to your project settings
   - Navigate to "Environment variables"
   - Add the variable for both Production and Preview environments

4. **Deploy**
   - Click "Save and Deploy"
   - Cloudflare Pages will automatically deploy on every push to your main branch

## Custom Domain

1. Go to your project in Cloudflare Pages
2. Navigate to "Custom domains"
3. Click "Set up a custom domain"
4. Follow the instructions to add your domain

## Environment Variables Access

For serverless functions (in `/api` directory), environment variables are accessible via:
```javascript
// In Cloudflare Pages Functions
export async function onRequest(context) {
  const apiKey = context.env.PAYLIX_API_KEY;
  // Your code here
}
```

## Serverless Functions

Cloudflare Pages supports serverless functions in the `/functions` directory. 
If you have API routes in `/api`, you may need to move them to `/functions` or use Cloudflare Workers.

### Converting Vercel API Routes to Cloudflare Pages Functions

Vercel API routes (in `/api`) need to be converted to Cloudflare Pages Functions format:

**Vercel format:**
```javascript
export default function handler(req, res) {
  res.status(200).json({ message: 'Hello' });
}
```

**Cloudflare Pages format:**
```javascript
export async function onRequest(context) {
  return new Response(JSON.stringify({ message: 'Hello' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

## Automatic Deployments

- Every push to your main branch triggers a production deployment
- Pull requests create preview deployments automatically
- You can configure branch deployments in the project settings

## Useful Links

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Pages Functions](https://developers.cloudflare.com/pages/platform/functions/)
- [Environment Variables](https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables)
