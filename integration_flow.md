# Paylix Integration Flow Diagram

## 🔄 Complete Payment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                              │
└─────────────────────────────────────────────────────────────────┘

1. USER BROWSES PRODUCTS
   │
   ├─→ Views product cards on homepage
   ├─→ Sees price, description, and "Buy Now" button
   └─→ Clicks "Buy Now" button
   
2. MODAL OPENS (Your Custom Modal)
   │
   ├─→ Shows product icon and name
   ├─→ Displays product summary
   ├─→ Shows price breakdown
   └─→ Renders Paylix button with product ID
   
3. PAYLIX BUTTON CLICKED
   │
   ├─→ Paylix embed script detects click
   ├─→ Validates product ID
   └─→ Opens Paylix secure modal
   
4. PAYLIX MODAL (Secure Checkout)
   │
   ├─→ User enters payment details
   ├─→ Selects payment method
   ├─→ Reviews order summary
   └─→ Confirms purchase
   
5. PAYMENT PROCESSING
   │
   ├─→ Paylix processes payment securely
   ├─→ Validates transaction
   └─→ Confirms payment success
   
6. PRODUCT DELIVERY
   │
   ├─→ Paylix sends webhook to your server (optional)
   ├─→ Product delivered instantly to user
   ├─→ User receives confirmation email
   └─→ Transaction complete ✅
```

## 📊 Technical Flow

```
┌──────────────┐
│  index.html  │  ← Loads Paylix embed script
└──────┬───────┘
       │
       ├─→ <script src="cdn.paylix.gg/static/js/embed.js"></script>
       └─→ <link href="cdn.paylix.gg/static/css/embed.css">
       │
       ▼
┌──────────────┐
│   main.js    │  ← Configures API key and product mapping
└──────┬───────┘
       │
       ├─→ PAYLIX_API_KEY = 'your_key'
       └─→ paylixProductMap = { 1: 'product_id' }
       │
       ▼
┌──────────────┐
│ buyNow(id)   │  ← User clicks "Buy Now"
└──────┬───────┘
       │
       ├─→ Opens custom modal
       └─→ Calls openPaylixEmbed(product)
       │
       ▼
┌──────────────────────┐
│ openPaylixEmbed()    │  ← Creates modal with product details
└──────┬───────────────┘
       │
       ├─→ Displays product summary
       └─→ Calls initializePaylixButton(productId)
       │
       ▼
┌──────────────────────────┐
│ initializePaylixButton() │  ← Creates Paylix button
└──────┬───────────────────┘
       │
       └─→ <button data-paylixecommerce-product="id">
       │
       ▼
┌──────────────┐
│ Paylix SDK   │  ← Detects button click
└──────┬───────┘
       │
       ├─→ Validates product ID
       ├─→ Opens secure payment modal
       └─→ Handles payment processing
       │
       ▼
┌──────────────┐
│   Success!   │  ← Product delivered
└──────────────┘
```

## 🎯 Button Attribute Flow

```
Product Button Flow:
┌─────────────────────────────────────────────┐
│ <button                                     │
│   data-paylixecommerce-product="6908..."   │ ← Product ID
│   type="submit"                             │ ← Required
│   alt="Buy Now with paylix.gg">            │ ← Accessibility
│   Buy Now                                   │
│ </button>                                   │
└─────────────────────────────────────────────┘
          │
          ├─→ Paylix SDK reads data-paylixecommerce-product
          ├─→ Fetches product details from Paylix API
          ├─→ Opens modal with product information
          └─→ Processes payment for single product

Group Button Flow:
┌─────────────────────────────────────────────┐
│ <button                                     │
│   data-paylixecommerce-group="group123"    │ ← Group ID
│   type="submit"                             │ ← Required
│   alt="Buy Now with paylix.gg">            │ ← Accessibility
│   Buy Bundle                                │
│ </button>                                   │
└─────────────────────────────────────────────┘
          │
          ├─→ Paylix SDK reads data-paylixecommerce-group
          ├─→ Fetches group details from Paylix API
          ├─→ Opens modal with all products in group
          └─→ Processes payment for entire bundle
```

## 🔐 Security Flow

```
┌─────────────┐
│ Your Server │  ← No payment data stored here
└─────┬───────┘
      │
      ├─→ Only stores: Product info, prices, descriptions
      └─→ No credit cards, no sensitive data
      │
      ▼
┌─────────────┐
│ Paylix SDK  │  ← Handles all payment data
└─────┬───────┘
      │
      ├─→ Encrypts payment information
      ├─→ Processes through secure gateway
      └─→ PCI DSS compliant
      │
      ▼
┌─────────────┐
│   Success   │  ← Product delivered securely
└─────────────┘
```

## 📱 Modal Interaction Flow

```
User Action                    System Response
───────────                    ───────────────

Click "Buy Now"        →       Open custom modal
                               ├─ Show product icon
                               ├─ Display product name
                               ├─ Show price
                               └─ Render Paylix button

Click Paylix Button    →       Paylix modal opens
                               ├─ Load product details
                               ├─ Show payment form
                               └─ Display payment methods

Enter Payment Info     →       Validate in real-time
                               ├─ Check card number
                               ├─ Verify CVV
                               └─ Validate expiry

Submit Payment         →       Process transaction
                               ├─ Authorize payment
                               ├─ Confirm success
                               └─ Deliver product

Close Modal           →       Return to site
                               ├─ Show success message
                               └─ Update user account
```

## 🎨 Customization Points

```
┌─────────────────────────────────────────────────────────────┐
│                    CUSTOMIZATION LAYERS                      │
└─────────────────────────────────────────────────────────────┘

Layer 1: Your Website
├─ Product cards design
├─ "Buy Now" button styling
├─ Product grid layout
└─ Overall theme/colors

Layer 2: Your Modal
├─ Modal background
├─ Product summary design
├─ Price display format
└─ Custom branding

Layer 3: Paylix Button
├─ Button text
├─ Button styling (.paylix-embed-button)
├─ Button size/padding
└─ Hover effects

Layer 4: Paylix Modal (Managed by Paylix)
├─ Payment form
├─ Payment methods
├─ Security badges
└─ Checkout flow
```

## 🔄 Error Handling Flow

```
Error Scenario                 Handling
──────────────                 ────────

Product ID not found   →       Show error in modal
                               ├─ Display friendly message
                               ├─ Suggest checking configuration
                               └─ Provide support link

API key invalid        →       Show configuration error
                               ├─ Guide to get API key
                               ├─ Link to dashboard
                               └─ Step-by-step instructions

Payment declined       →       Paylix handles this
                               ├─ Shows decline reason
                               ├─ Suggests alternative
                               └─ Allows retry

Network error          →       Automatic retry
                               ├─ Show loading state
                               ├─ Retry connection
                               └─ Fallback message
```

## 📊 Data Flow

```
┌──────────────┐
│  Your Site   │
└──────┬───────┘
       │
       ├─→ Product Name
       ├─→ Product Description
       ├─→ Product Price
       ├─→ Product Icon
       └─→ Product ID
       │
       ▼
┌──────────────┐
│ Paylix API   │
└──────┬───────┘
       │
       ├─→ Validates Product ID
       ├─→ Fetches Product Details
       ├─→ Processes Payment
       └─→ Delivers Product
       │
       ▼
┌──────────────┐
│   Customer   │
└──────────────┘
       │
       ├─→ Receives Product
       ├─→ Gets Email Confirmation
       └─→ Can Access Purchase
```

## 🎯 Integration Checklist Flow

```
Step 1: Include Scripts
   ├─ ✅ Add embed.js to <head>
   └─ ✅ Add embed.css (optional)
   
Step 2: Configure
   ├─ ✅ Set API key
   └─ ✅ Map product IDs
   
Step 3: Create Button
   ├─ ✅ Add data-paylixecommerce-product
   ├─ ✅ Set type="submit"
   └─ ✅ Add alt text
   
Step 4: Test
   ├─ ✅ Click button
   ├─ ✅ Modal opens
   ├─ ✅ Payment processes
   └─ ✅ Product delivered
   
Step 5: Go Live
   ├─ ✅ Disable test mode
   ├─ ✅ Set up webhooks
   └─ ✅ Monitor transactions
```

---

**Visual Guide Complete** ✅  
For code examples, see: `PAYLIX_INTEGRATION.md`  
For live demo, open: `paylix-demo.html`
