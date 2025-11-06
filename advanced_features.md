# Paylix Advanced Features Guide

## 🚀 Custom Fields Overview

Paylix provides extensive customization options through data attributes. This guide covers all available custom fields.

## 📋 Complete Attribute Reference

### Basic Attributes

| Attribute | Type | Description | Example |
|-----------|------|-------------|---------|
| `data-paylixecommerce-product` | String | Product unique ID (required) | `"6908cfd78d4f3"` |
| `data-paylixecommerce-group` | String | Group unique ID for bundles | `"group123"` |
| `type` | String | Button type (required) | `"submit"` |
| `alt` | String | Accessibility text | `"Buy Now with paylix.gg"` |

### Gateway Selection

Pre-select the payment gateway for customers:

```html
<button 
    data-paylixecommerce-product="PRODUCT_ID"
    data-paylixecommerce-gateway="USDT"
    type="submit">
    Pay with USDT
</button>
```

**Available Gateways:**

| Gateway | Description |
|---------|-------------|
| `BITCOIN` | Bitcoin payments |
| `ETHEREUM` | Ethereum payments |
| `LITECOIN` | Litecoin payments |
| `USDT` | Tether (multiple blockchains) |
| `USDC` | USD Coin |
| `USDC_NATIVE` | Native USDC |
| `TRON` | Tron payments |
| `BINANCE_COIN` | Binance Coin (BNB) |
| `SOLANA` | Solana payments |
| `POLYGON` | Polygon (MATIC) |
| `MONERO` | Monero payments |
| `BITCOIN_CASH` | Bitcoin Cash |
| `STRIPE` | Credit/Debit cards |
| `PAYPAL` | PayPal payments |
| `SKRILL` | Skrill e-wallet |
| `PERFECT_MONEY` | Perfect Money |
| `SUMUP` | SumUp payments |
| `PADDLE` | Paddle payments |

### Blockchain Selection

For cryptocurrencies with multiple blockchains (USDT, USDC, etc.):

```html
<button 
    data-paylixecommerce-product="PRODUCT_ID"
    data-paylixecommerce-gateway="USDT"
    data-paylixecommerce-blockchain="ERC20"
    type="submit">
    Pay with USDT (ERC20)
</button>
```

**Available Blockchains:**

| Blockchain | Description |
|------------|-------------|
| `BEP20` | Binance Smart Chain |
| `ERC20` | Ethereum Network |
| `MATIC` | Polygon Network |
| `TRC20` | Tron Network |

**Note:** Certain cryptocurrencies can have multiple blockchains. To default them, you'll need to specify the `data-paylixecommerce-blockchain` attribute.

### Step Control

Control which step customers see when opening the embed:

```html
<!-- Show product details with addons and coupon options -->
<button 
    data-paylixecommerce-product="PRODUCT_ID"
    data-paylixecommerce-step="GATEWAY"
    type="submit">
    View Product
</button>

<!-- Skip directly to checkout -->
<button 
    data-paylixecommerce-product="PRODUCT_ID"
    data-paylixecommerce-step="CHECKOUT"
    type="submit">
    Quick Checkout
</button>
```

**Options:**
- `GATEWAY` - Shows product details where customers can choose addons and set coupons
- `CHECKOUT` - Skips directly to payment

**Default:** If no step is specified, the embed opens with product details.

### Email Prefill

Pre-fill the customer's email address:

```html
<button 
    data-paylixecommerce-product="PRODUCT_ID"
    data-paylixecommerce-email="customer@example.com"
    type="submit">
    Checkout
</button>
```

**Benefits:**
- Faster checkout for logged-in users
- Reduces form friction
- Improves conversion rates

**Note:** When you do this, if there are no other custom fields, the user will be directed to checkout immediately.

### Coupon Code

Apply a coupon code automatically:

```html
<button 
    data-paylixecommerce-product="PRODUCT_ID"
    data-paylixecommerce-coupon="10_PERCENT_OFF"
    type="submit">
    Apply Discount
</button>
```

**Features:**
- Automatically applies the coupon
- If coupon is invalid, no error appears
- Customer can still change/remove the coupon

### Quantity Control

Set the default quantity:

```html
<button 
    data-paylixecommerce-product="PRODUCT_ID"
    data-paylixecommerce-quantity="3"
    type="submit">
    Buy 3 Units
</button>
```

**Use Cases:**
- Bulk purchase buttons
- Package deals
- Volume discounts

### Product Variant

Pre-select a specific product variant:

```html
<button 
    data-paylixecommerce-product="PRODUCT_ID"
    data-paylixecommerce-variant="Premium Edition"
    type="submit">
    Buy Premium
</button>
```

**Example:**
```html
data-paylixecommerce-variant="First Variant"
```

**Note:** The variant name must match exactly as configured in your Paylix product.

### Custom Fields

Hide or prefill custom fields from your Paylix product:

```html
<button 
    data-paylixecommerce-product="PRODUCT_ID"
    data-paylixecommerce-custom-discord="@username#1234"
    type="submit">
    Checkout
</button>
```

**Format:**
```html
data-paylixecommerce-custom-{{ FIELD_NAME }}
```

**Example:**
```html
<!-- Prefill Discord username -->
<button 
    data-paylixecommerce-custom-discord="@user#0000"
    ...>

<!-- Prefill reference ID -->
<button 
    data-paylixecommerce-custom-reference="12345678"
    ...>
```

**Note:** The custom field will be prefilled and hidden during the checkout phase of the embed.

## 🎨 Custom Styling

### Method 1: HTML Head (Recommended)

Add the CSS link in your HTML `<head>` with the ID `paylixecommerce-css`:

```html
<link 
    href="https://cdn.paylix.gg/static/css/custom-embed-styles.css" 
    rel="stylesheet" 
    id="paylixecommerce-css">
```

**Benefits:**
- Applies to all Paylix buttons on the page
- Loaded once for better performance
- Easier to manage

### Method 2: Button Attribute

Pass the CSS link directly on the button:

```html
<button 
    data-paylixecommerce-product="PRODUCT_ID"
    data-paylixecommerce-css="https://cdn.paylix.gg/static/css/custom-embed-styles.css"
    type="submit">
    Styled Checkout
</button>
```

**Benefits:**
- Different styles for different buttons
- More granular control
- Useful for A/B testing

**Note:** The `data-paylixecommerce-css` property on the button has priority over the HTML head CSS imported.

### Custom CSS File

Create your own custom CSS file to match your brand:

```css
/* custom-paylix-styles.css */

/* Customize modal background */
.paylix-modal {
    background: rgba(0, 0, 0, 0.95) !important;
}

/* Customize button colors */
.paylix-button-primary {
    background: linear-gradient(135deg, #8359cf 0%, #5c3d99 100%) !important;
}

/* Customize text colors */
.paylix-text-primary {
    color: #8359cf !important;
}

/* Customize input fields */
.paylix-input {
    border-color: #8359cf !important;
}
```

Then reference it:

```html
<link 
    href="https://yourdomain.com/css/custom-paylix-styles.css" 
    rel="stylesheet" 
    id="paylixecommerce-css">
```

## 🔥 Complete Example

Here's a button with all custom fields configured:

```html
<button 
    data-paylixecommerce-product="6908cfd78d4f3"
    data-paylixecommerce-gateway="USDT"
    data-paylixecommerce-blockchain="ERC20"
    data-paylixecommerce-step="CHECKOUT"
    data-paylixecommerce-email="customer@example.com"
    data-paylixecommerce-coupon="10_PERCENT_OFF"
    data-paylixecommerce-quantity="1"
    data-paylixecommerce-variant="Premium Edition"
    data-paylixecommerce-custom-discord="@user#1234"
    data-paylixecommerce-custom-reference="REF123"
    data-paylixecommerce-css="https://cdn.paylix.gg/static/css/custom-embed-styles.css"
    type="submit"
    alt="Buy Now with paylix.gg">
    <i class="fas fa-shopping-cart"></i> Complete Purchase
</button>
```

## 💡 Best Practices

### 1. Gateway Selection
- Use for crypto-focused stores
- Pre-select based on user preference
- Consider regional payment methods

### 2. Step Control
- Use `CHECKOUT` for returning customers
- Use `GATEWAY` for first-time buyers
- A/B test conversion rates

### 3. Email Prefill
- Always prefill for logged-in users
- Improves checkout speed
- Reduces cart abandonment

### 4. Coupon Codes
- Use for marketing campaigns
- Apply automatically from URL parameters
- Track campaign performance

### 5. Custom Fields
- Minimize required fields
- Prefill when possible
- Use for order customization

### 6. Custom Styling
- Match your brand colors
- Maintain consistency
- Test on mobile devices

## 🎯 Use Cases

### E-commerce Store
```html
<button 
    data-paylixecommerce-product="PRODUCT_ID"
    data-paylixecommerce-gateway="STRIPE"
    data-paylixecommerce-step="CHECKOUT"
    data-paylixecommerce-quantity="1"
    type="submit">
    Buy Now
</button>
```

### Crypto Payment
```html
<button 
    data-paylixecommerce-product="PRODUCT_ID"
    data-paylixecommerce-gateway="USDT"
    data-paylixecommerce-blockchain="ERC20"
    data-paylixecommerce-step="CHECKOUT"
    type="submit">
    Pay with USDT
</button>
```

### Subscription Service
```html
<button 
    data-paylixecommerce-product="PRODUCT_ID"
    data-paylixecommerce-email="user@example.com"
    data-paylixecommerce-variant="Monthly"
    data-paylixecommerce-custom-userid="12345"
    type="submit">
    Subscribe
</button>
```

### Marketing Campaign
```html
<button 
    data-paylixecommerce-product="PRODUCT_ID"
    data-paylixecommerce-coupon="SUMMER2024"
    data-paylixecommerce-step="CHECKOUT"
    type="submit">
    Get 20% Off
</button>
```

## 🔍 Debugging

### Check if Paylix is Loaded
```javascript
console.log('Paylix SDK:', typeof window.Paylix !== 'undefined' ? 'Loaded' : 'Not Loaded');
```

### Verify Custom CSS
```javascript
const cssLink = document.getElementById('paylixecommerce-css');
console.log('Custom CSS:', cssLink ? 'Found' : 'Not Found');
```

### Test Button Attributes
```javascript
const button = document.querySelector('[data-paylixecommerce-product]');
console.log('Product ID:', button.dataset.paylixecommerceProduct);
console.log('Gateway:', button.dataset.paylixecommerceGateway);
console.log('Step:', button.dataset.paylixecommerceStep);
```

## 📚 Resources

- **Live Demo**: Open `paylix-advanced-demo.html`
- **Basic Demo**: Open `paylix-demo.html`
- **Integration Guide**: See `PAYLIX_INTEGRATION.md`
- **Quick Reference**: See `QUICK_REFERENCE.md`
- **Paylix Docs**: https://docs.paylix.gg

## 🎓 Next Steps

1. **Test Basic Integration**: Start with product ID only
2. **Add Gateway**: Pre-select payment method
3. **Configure Step**: Optimize checkout flow
4. **Prefill Data**: Add email and custom fields
5. **Apply Styling**: Match your brand
6. **Monitor Performance**: Track conversion rates

---

**Advanced Features Complete** ✅  
For implementation help, see `paylix-advanced-demo.html`
