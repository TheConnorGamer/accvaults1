# AccVaults - Premium Digital Services

A modern e-commerce platform for digital products with integrated Paylix.gg payment processing.

## 🚀 Quick Start

### 1. Configure Paylix Integration

Open `js/main.js` and update line 210:

```javascript
const PAYLIX_API_KEY = 'EzxWYoBzSAECBsJojXHrAOJQbBD4SEHdPJNS7b6mu418C96uVb2RQiP8ALzj5CzA';

const paylixProductMap = {
    1: '6908cfd78d4f3'      // CapCut Premium
    // Add more products:
    // 2: 'YOUR_PRODUCT_ID_2',
    // 3: 'YOUR_PRODUCT_ID_3',
};
```

### 2. Get Your Credentials

- Go to [Paylix Dashboard](https://paylix.gg/dashboard)
- **API Key**: Settings → API → Copy API Key
- **Product IDs**: Products → Click each product → Copy Product ID

### 3. Run the Website

```bash
python -m http.server 8000
```

Then visit: http://localhost:8000

### 4. View Integration Demos

- **Basic Demo**: Open `paylix-demo.html` for Product and Group button examples
- **Advanced Demo**: Open `paylix-advanced-demo.html` for all custom fields and options

## ✨ Features

- Interactive login/register system
- Currency switcher (GBP, USD, EUR)
- Shopping cart with checkout
- Paylix.gg payment integration
- Animated glowing background
- Particle effects
- Mobile responsive

## 💳 Paylix Integration

This project uses Paylix.gg for secure payment processing with extensive customization options.

### Basic Button Types

#### Product Button (Single Product)
```html
<button 
    data-paylixecommerce-product="PRODUCT_UNIQID"
    type="submit"
    alt="Buy Now with paylix.gg">
    Purchase
</button>
```

#### Group Button (Multiple Products)
```html
<button 
    data-paylixecommerce-group="GROUP_UNIQID"
    type="submit"
    alt="Buy Now with paylix.gg">
    Purchase Bundle
</button>
```

### Advanced Custom Fields

Enhance your checkout experience with custom fields:

```html
<button 
    data-paylixecommerce-product="PRODUCT_ID"
    data-paylixecommerce-gateway="USDT"
    data-paylixecommerce-blockchain="ERC20"
    data-paylixecommerce-step="CHECKOUT"
    data-paylixecommerce-email="customer@example.com"
    data-paylixecommerce-coupon="DISCOUNT_CODE"
    data-paylixecommerce-quantity="1"
    data-paylixecommerce-variant="Premium"
    data-paylixecommerce-custom-discord="@user#0000"
    data-paylixecommerce-css="https://cdn.paylix.gg/static/css/custom-embed-styles.css"
    type="submit">
    Complete Purchase
</button>
```

**Available Custom Fields:**
- 🔐 **Gateway** - Pre-select payment method (USDT, STRIPE, PAYPAL, etc.)
- ⛓️ **Blockchain** - Specify network (ERC20, BEP20, TRC20, MATIC)
- 🚀 **Step** - Control checkout flow (GATEWAY or CHECKOUT)
- 📧 **Email** - Prefill customer email
- 🏷️ **Coupon** - Auto-apply discount codes
- 🔢 **Quantity** - Set default quantity
- 🎨 **Variant** - Pre-select product variant
- 🎯 **Custom Fields** - Prefill any custom field
- 💅 **CSS** - Apply custom styling

📖 **Documentation**:
- [PAYLIX_INTEGRATION.md](PAYLIX_INTEGRATION.md) - Complete setup guide
- [ADVANCED_FEATURES.md](ADVANCED_FEATURES.md) - All custom fields explained
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick reference card

## 📁 Structure

```
windsurf-project-3/
├── css/
│   ├── style.css                # Base styles
│   ├── components.css           # Component styles
│   └── animations.css           # Animation keyframes
├── js/
│   └── main.js                  # All functionality
├── index.html                   # Home page
├── products.html                # Products page
├── reviews.html                 # Reviews page
├── status.html                  # Status page
├── downloads.html               # Downloads page
├── paylix-demo.html             # Basic integration demo
├── paylix-advanced-demo.html    # Advanced features demo
├── PAYLIX_INTEGRATION.md        # Complete integration guide
├── ADVANCED_FEATURES.md         # Custom fields documentation
├── QUICK_REFERENCE.md           # Quick reference card
├── INTEGRATION_FLOW.md          # Visual flow diagrams
└── IMPLEMENTATION_SUMMARY.md    # Implementation summary
```

## 🎨 Customization

### Change Colors

Edit CSS variables in `css/style.css`:

```css
:root {
    --theme-color: #8359cf;
    --primary-bg: #0b0b0bba;
    --secondary-bg: #141414;
}
```

### Add Products

Edit the `products` array in `js/main.js` (line 1):

```javascript
const products = [
    {
        id: 1,
        name: 'Product Name',
        description: 'Product description',
        price: '£4.99',
        category: 'streaming',
        icon: '🎬',
        badge: 'Popular'
    }
];
```

## 🧪 Test Cards

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002

## 📞 Support

- Paylix Dashboard: https://paylix.gg/dashboard
- Paylix Docs: https://docs.paylix.gg
