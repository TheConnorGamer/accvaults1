# Paylix Integration - Quick Reference Card

## 🚀 Essential URLs

| Resource | URL |
|----------|-----|
| **Your Website** | http://localhost:8000 |
| **Demo Page** | http://localhost:8000/paylix-demo.html |
| **Paylix Dashboard** | https://paylix.gg/dashboard |
| **Paylix Docs** | https://docs.paylix.gg |

## 📦 Required Scripts

```html
<!-- In your <head> section -->
<script src="https://cdn.paylix.gg/static/js/embed.js"></script>
<link href="https://cdn.paylix.gg/static/css/embed.css" rel="stylesheet">
```

## 🔘 Button Templates

### Product Button
```html
<button 
    data-paylixecommerce-product="6908cfd78d4f3"
    type="submit"
    alt="Buy Now with paylix.gg">
    Buy Now - £2.50
</button>
```

### Group Button
```html
<button 
    data-paylixecommerce-group="YOUR_GROUP_ID"
    type="submit"
    alt="Buy Now with paylix.gg">
    Buy Bundle - £10.00
</button>
```

## ⚙️ Configuration Files

| Setting | Location | Line |
|---------|----------|------|
| **API Key** | `js/main.js` | 210 |
| **Product Map** | `js/main.js` | 214-216 |
| **Products Array** | `js/main.js` | 38-48 |

## 🎯 Quick Setup (3 Steps)

### Step 1: Get Credentials
```
Paylix Dashboard → Settings → API → Copy API Key
Paylix Dashboard → Products → Copy Product IDs
```

### Step 2: Update Configuration
```javascript
// js/main.js line 210
const PAYLIX_API_KEY = 'YOUR_API_KEY';

// js/main.js line 214
const paylixProductMap = {
    1: 'YOUR_PRODUCT_ID'
};
```

### Step 3: Test
```bash
python -m http.server 8000
# Open: http://localhost:8000
# Click: "Buy Now" on any product
```

## 🧪 Test Product

**CapCut Premium**
- Website ID: `1`
- Paylix ID: `6908cfd78d4f3`
- Price: `£2.50`
- Status: ✅ Configured

## 📋 Checklist

- [ ] Paylix scripts included in HTML
- [ ] API key configured
- [ ] Product IDs mapped
- [ ] Test purchase completed
- [ ] Payment modal opens correctly
- [ ] Products delivered after payment

## 🔍 Troubleshooting

| Issue | Solution |
|-------|----------|
| Button doesn't work | Check console for errors, verify script loaded |
| Modal doesn't open | Verify product ID exists in Paylix Dashboard |
| API key error | Check API key is correct and has permissions |
| Product not found | Verify product ID mapping is correct |

## 💡 Pro Tips

1. **Test Mode**: Enable in Paylix Dashboard for development
2. **Webhooks**: Set up for order notifications
3. **Custom Styling**: Edit `.paylix-embed-button` class
4. **Multiple Products**: Add to both `products` array and `paylixProductMap`
5. **Groups**: Create in Paylix Dashboard for bundle sales

## 📞 Support

**Need Help?**
- 📖 Full Guide: `PAYLIX_INTEGRATION.md`
- 🎨 Demo: `paylix-demo.html`
- 💬 Discord: https://discord.gg/paylix
- 📧 Email: support@paylix.gg

## 🎨 Button Styling

```css
.paylix-embed-button {
    background: linear-gradient(135deg, #8359cf 0%, #5c3d99 100%);
    padding: 18px 24px;
    border-radius: 12px;
    color: white;
    font-weight: 700;
}
```

## 🔐 Security Notes

✅ All payments processed securely by Paylix  
✅ PCI compliant  
✅ SSL/TLS encryption  
✅ No sensitive data stored on your server  
✅ Instant delivery after payment  

---

**Quick Start**: Open `paylix-demo.html` for live examples!
