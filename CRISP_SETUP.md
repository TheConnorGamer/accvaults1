# Crisp Chat Setup Instructions

## How to Add Crisp Chat to Your Site

1. **Get your Crisp Website ID:**
   - Go to https://app.crisp.chat/
   - Login to your Crisp account
   - Go to Settings → Website Settings → Setup Instructions
   - Find your Website ID (looks like: `abc12345-6789-0def-ghij-klmnopqrstuv`)

2. **Add it to your site:**
   - Open `index.html`
   - Find line 236: `window.CRISP_WEBSITE_ID="YOUR_CRISP_WEBSITE_ID";`
   - Replace `YOUR_CRISP_WEBSITE_ID` with your actual Crisp Website ID
   - Example: `window.CRISP_WEBSITE_ID="abc12345-6789-0def-ghij-klmnopqrstuv";`

3. **Deploy:**
   - Commit and push the changes
   - Wait for Cloudflare to deploy
   - Crisp chat will appear on your site!

## The Code is Already Added!

The Crisp chat script is already in your `index.html` file. You just need to replace the placeholder with your actual Website ID.

The chat widget will automatically appear in the bottom-right corner of your site once you add your Website ID.
