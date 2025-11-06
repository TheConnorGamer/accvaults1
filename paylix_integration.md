# Paylix.gg Integration Guide

## Overview
This project is integrated with Paylix.gg for secure payment processing. The integration supports both **Product Buttons** and **Group Buttons** for flexible checkout options.

## Integration Status
✅ **Embed Script**: Loaded from `https://cdn.paylix.gg/static/js/embed.js`  
✅ **Embed CSS**: Loaded from `https://cdn.paylix.gg/static/css/embed.css` (optional, improves loader styling)  
✅ **API Key**: Configured in `js/main.js` (line 210)  
✅ **Product Mapping**: Configured in `js/main.js` (lines 214-216)

## Configuration

### 1. API Key Setup
Your Paylix API key is stored in `js/main.js`:

```javascript
const PAYLIX_API_KEY = 'EzxWYoBzSAECBsJojXHrAOJQbBD4SEHdPJNS7b6mu418C96uVb2RQiP8ALzj5CzA';
```

**To get your API key:**
1. Go to [Paylix Dashboard](https://paylix.gg/dashboard)
2. Navigate to Settings → API
3. Copy your API Key
4. Replace the value in `js/main.js`

### 2. Product ID Mapping
Map your website product IDs to Paylix product IDs in `js/main.js`:

```javascript
const paylixProductMap = {
    1: '6908cfd78d4f3'      // CapCut Premium
    // Add more products here:
    // 2: 'YOUR_PAYLIX_PRODUCT_ID_2',
    // 3: 'YOUR_PAYLIX_PRODUCT_ID_3',
};
```

**To get Paylix Product IDs:**
1. Go to [Paylix Dashboard](https://paylix.gg/dashboard)
2. Navigate to Products
3. Click on a product
4. Copy the Product ID (or Group ID for group purchases)
5. Add it to the `paylixProductMap` object

## Button Types

### Product Button (Single Product)
Used for individual product purchases:

```html
<button 
    data-paylixecommerce-product="PRODUCT_UNIQID"
    type="submit"
    alt="Buy Now with paylix.gg">
    Purchase
</button>
```

### Group Button (Multiple Products)
Used for purchasing product groups:

```html
<button 
    data-paylixecommerce-group="GROUP_UNIQID"
    type="submit"
    alt="Buy Now with paylix.gg">
    Purchase
</button>
```

## Current Implementation

### How It Works
1. User clicks "Buy Now" on a product card
2. `buyNow(productId)` function is called
3. A modal opens with product details
4. Paylix embed button is dynamically created with the correct product ID
5. User clicks the Paylix button to proceed to checkout
6. Paylix handles the entire payment flow in their secure modal

### Key Functions

**`openPaylixEmbed(product)`** - Opens the checkout modal  
**`initializePaylixButton(productId)`** - Creates the Paylix button with correct attributes  
**`closePaylixModal()`** - Closes the modal

## Testing

To test the integration:

1. Open `index.html` in a browser
2. Click "Buy Now" on the CapCut Premium product
3. The Paylix checkout modal should appear
4. Click "Proceed to Secure Checkout"
5. Paylix payment modal should open

## Customization

### Custom Button Styling
The Paylix button uses the `.paylix-embed-button` class. You can customize it in `js/main.js` (lines 948-972):

```css
.paylix-embed-button {
    width: 100%;
    padding: 18px 24px;
    background: linear-gradient(135deg, #8359cf 0%, #5c3d99 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-weight: 700;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.3s ease;
}
```

### Adding More Products

1. Add product to the `products` array in `js/main.js`:
```javascript
{
    id: 2,
    name: 'New Product',
    description: 'Product description',
    price: '£5.00',
    category: 'streaming',
    icon: '🎵',
    badge: 'New'
}
```

2. Create the product in Paylix Dashboard

3. Add the mapping to `paylixProductMap`:
```javascript
const paylixProductMap = {
    1: '6908cfd78d4f3',
    2: 'YOUR_NEW_PRODUCT_ID'
};
```

## Features

✅ **Instant Delivery** - Products delivered immediately after purchase  
✅ **Secure Payments** - All transactions encrypted and secure  
✅ **Multiple Payment Methods** - Visa, Mastercard, PayPal, Bitcoin, and more  
✅ **24/7 Support** - Customer support always available  
✅ **Auto Replacement** - Automatic replacement for any issues  

## Troubleshooting

### Button Not Working
- Verify the Paylix embed script is loaded (check browser console)
- Check that the product ID exists in Paylix Dashboard
- Ensure the product ID mapping is correct in `paylixProductMap`

### API Key Issues
- Verify your API key is correct
- Check that the API key has the necessary permissions
- Make sure you're not using the placeholder value

### Modal Not Opening
- Check browser console for JavaScript errors
- Verify the `data-paylixecommerce-product` attribute is set correctly
- Ensure the Paylix embed script loaded successfully

## Documentation Links

- [Paylix.gg Dashboard](https://paylix.gg/dashboard)
- [Paylix API Documentation](https://docs.paylix.gg)
- [Paylix Support](https://discord.gg/paylix)

## Notes

- The embed script automatically handles the payment modal
- No additional backend code is required for basic integration
- Webhooks can be configured in Paylix Dashboard for order notifications
- Test mode is available in Paylix Dashboard for development

---

**Last Updated**: November 2024  
**Integration Version**: 1.0  
**Paylix Embed Version**: Latest
