# Paylix Product Setup Guide

## Current Products with Variants

Your store now has 8 products with multiple duration variants. You need to create separate products in Paylix for each variant.

### Products to Create in Paylix Dashboard

#### 1. Netflix Premium
- **1 Month** - £4.99
- **3 Months** - £12.99
- **6 Months** - £22.99
- **12 Months** - £39.99

#### 2. Spotify Premium
- **1 Month** - £3.99
- **3 Months** - £10.99
- **6 Months** - £19.99
- **12 Months** - £34.99

#### 3. Disney+ Premium
- **1 Month** - £5.99
- **3 Months** - £15.99
- **6 Months** - £29.99

#### 4. YouTube Premium
- **1 Month** - £4.49
- **3 Months** - £12.49
- **6 Months** - £23.99

#### 5. Discord Nitro
- **1 Month** - £6.99
- **3 Months** - £18.99
- **6 Months** - £35.99

#### 6. CapCut Premium
- **Single Product** - £2.50 (No variants)

#### 7. Canva Pro
- **1 Month** - £7.99
- **6 Months** - £42.99
- **12 Months** - £79.99

#### 8. NordVPN
- **1 Month** - £3.99
- **6 Months** - £20.99
- **12 Months** - £35.99
- **24 Months** - £59.99

---

## How to Configure

### Step 1: Create Products in Paylix
1. Go to your Paylix Dashboard
2. Navigate to Products section
3. Create a new product for EACH variant listed above
4. Set the correct price for each
5. Copy the Product ID for each one

### Step 2: Update main.js
Open `js/main.js` and find the `paylixProductMap` (around line 389).

Replace the placeholder IDs with your actual Paylix Product IDs:

```javascript
const paylixProductMap = {
    // Netflix Premium variants
    '1-1m': 'YOUR_PAYLIX_PRODUCT_ID_HERE',
    '1-3m': 'YOUR_PAYLIX_PRODUCT_ID_HERE',
    '1-6m': 'YOUR_PAYLIX_PRODUCT_ID_HERE',
    '1-12m': 'YOUR_PAYLIX_PRODUCT_ID_HERE',
    
    // Spotify Premium variants
    '2-1m': 'YOUR_PAYLIX_PRODUCT_ID_HERE',
    '2-3m': 'YOUR_PAYLIX_PRODUCT_ID_HERE',
    '2-6m': 'YOUR_PAYLIX_PRODUCT_ID_HERE',
    '2-12m': 'YOUR_PAYLIX_PRODUCT_ID_HERE',
    
    // Disney+ Premium variants
    '3-1m': 'YOUR_PAYLIX_PRODUCT_ID_HERE',
    '3-3m': 'YOUR_PAYLIX_PRODUCT_ID_HERE',
    '3-6m': 'YOUR_PAYLIX_PRODUCT_ID_HERE',
    
    // YouTube Premium variants
    '4-1m': 'YOUR_PAYLIX_PRODUCT_ID_HERE',
    '4-3m': 'YOUR_PAYLIX_PRODUCT_ID_HERE',
    '4-6m': 'YOUR_PAYLIX_PRODUCT_ID_HERE',
    
    // Discord Nitro variants
    '5-1m': 'YOUR_PAYLIX_PRODUCT_ID_HERE',
    '5-3m': 'YOUR_PAYLIX_PRODUCT_ID_HERE',
    '5-6m': 'YOUR_PAYLIX_PRODUCT_ID_HERE',
    
    // CapCut Premium (no variants)
    6: '6908cfd78d4f3', // Your existing ID
    
    // Canva Pro variants
    '7-1m': 'YOUR_PAYLIX_PRODUCT_ID_HERE',
    '7-6m': 'YOUR_PAYLIX_PRODUCT_ID_HERE',
    '7-12m': 'YOUR_PAYLIX_PRODUCT_ID_HERE',
    
    // NordVPN variants
    '8-1m': 'YOUR_PAYLIX_PRODUCT_ID_HERE',
    '8-6m': 'YOUR_PAYLIX_PRODUCT_ID_HERE',
    '8-12m': 'YOUR_PAYLIX_PRODUCT_ID_HERE',
    '8-24m': 'YOUR_PAYLIX_PRODUCT_ID_HERE'
};
```

### Step 3: Test
1. Reload your website
2. Select a product variant from the dropdown
3. Click "Buy Now"
4. The Paylix checkout should load with the correct product and price

---

## What's Fixed

✅ **Buy Now button** - Now works with Paylix integration
✅ **Product variants** - Dropdown selection for different durations
✅ **Dynamic pricing** - Prices update when you select variants
✅ **Cart functionality** - Add to cart with selected variant
✅ **Paylix modal** - Shows product name, variant, and price
✅ **Payment methods** - Paylix handles all payment options (cards, crypto, etc.)

---

## Notes

- Each variant needs its own Paylix product because they have different prices
- The variant ID format is: `productId-duration` (e.g., '1-1m' = Netflix 1 Month)
- CapCut doesn't have variants, so it uses just the product ID: `6`
- Cart checkout currently works for single items only (Paylix limitation)
