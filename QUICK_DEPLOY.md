# Quick Deploy to Cloudflare Pages

## Option 1: Drag and Drop (Static Files Only - NO API Functions)

⚠️ **Warning**: Drag and drop does NOT support the `/functions` directory. Your API routes won't work.

1. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
2. Click "Upload assets"
3. Drag your project folder (excluding `node_modules`, `functions`, etc.)
4. This will only work for static HTML/CSS/JS files

## Option 2: Git Connection (Recommended - Includes API Functions)

This is the BEST option because it supports your `/functions` API routes.

### Steps:

1. **Push your code to GitHub/GitLab**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Connect to Cloudflare Pages**
   - Go to [Cloudflare Pages](https://pages.cloudflare.com/)
   - Click "Create a project"
   - Click "Connect to Git"
   - Select your repository
   - Configure build settings:
     - **Build command**: (leave empty)
     - **Build output directory**: `/`
     - **Root directory**: `/`

3. **Set Environment Variable**
   - After creating the project, go to **Settings** → **Environment variables**
   - Add variable:
     - **Variable name**: `PAYLIX_API_KEY`
     - **Value**: Your Paylix API key
     - **Environment**: Select both "Production" and "Preview"
   - Click "Save"

4. **Deploy**
   - Click "Save and Deploy"
   - Your site will be live at `https://your-project.pages.dev`

## Option 3: Wrangler CLI (Advanced - Direct Upload with Functions)

This allows drag-and-drop style deployment but WITH function support.

### Steps:

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Create wrangler.toml**
   (Already created below)

4. **Deploy**
   ```bash
   wrangler pages deploy . --project-name=accvaults
   ```

5. **Set Environment Variable**
   ```bash
   wrangler pages secret put PAYLIX_API_KEY --project-name=accvaults
   ```
   Then paste your API key when prompted.

---

## How to Get Your Paylix API Key

1. Go to [Paylix Dashboard](https://dev.paylix.gg/)
2. Login to your merchant account
3. Navigate to **Settings** → **API Keys** or **Developer Settings**
4. Copy your API key
5. Add it to Cloudflare Pages environment variables (see above)

---

## Recommended Approach

**Use Option 2 (Git Connection)** - It's the easiest and most reliable for projects with serverless functions.
