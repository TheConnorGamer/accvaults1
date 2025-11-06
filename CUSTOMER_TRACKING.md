# Customer Tracking System

## 📊 Where Customer Data is Stored

### 1. **Paylix Customers API** (Primary Storage)
All customer registrations and logins are stored in Paylix's database:
- **Email** - Customer email address
- **Name** - First name
- **Surname** - Last name  
- **Metadata:**
  - `username` - Display username
  - `password_hash` - Hashed password
  - `registered_at` - Registration timestamp
  - `registration_source` - "website"

### 2. **Local Tracking** (`data/customers.json`)
A simple JSON file in the repo for quick reference.

**Note:** Cloudflare Pages Functions can't write to files, so this file is manually updated or you need to use Cloudflare KV/D1 for automatic updates.

---

## 🔍 How to View All Customers

### Option 1: Paylix Dashboard
1. Login to [Paylix Dashboard](https://dev.paylix.gg)
2. Go to **Customers** section
3. View all registered customers

### Option 2: Use Paylix API
```bash
curl -X GET "https://dev.paylix.gg/v1/customers" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Option 3: Admin Dashboard (Coming Soon)
The dashboard will show a list of all customers from Paylix API.

---

## 📝 Customer Data Structure

### In Paylix:
```json
{
  "id": 123,
  "uniqid": "customer_abc123",
  "email": "user@example.com",
  "name": "John",
  "surname": "Doe",
  "shop_id": 0,
  "metadata": {
    "username": "johndoe",
    "password_hash": "aGFzaGVk...",
    "registered_at": "2025-01-06T20:00:00.000Z",
    "registration_source": "website"
  }
}
```

### In Local Storage (Browser):
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "loggedIn": true,
  "isStaff": false,
  "role": "customer",
  "customerId": "customer_abc123",
  "loginTime": "2025-01-06T20:00:00.000Z"
}
```

---

## 🔐 Admin Access to Customer Data

### View All Customers:
Admins can access customer data through:

1. **Paylix Dashboard** - Full customer management
2. **Admin Dashboard** - View customer list (to be implemented)
3. **API Endpoint** - `/api/auth` with action `listCustomers`

### Customer Support:
When a customer needs help:
1. Ask for their email
2. Look them up in Paylix Dashboard
3. View their:
   - Registration date
   - Order history
   - Account details

---

## 🚀 Automatic Tracking (Future Enhancement)

To automatically save customer data on each registration:

### Option 1: Cloudflare KV Storage
```javascript
// In auth.js after successful registration
await env.CUSTOMERS_KV.put(
  customer.email,
  JSON.stringify(customerData),
  { metadata: { registeredAt: new Date().toISOString() } }
);
```

### Option 2: Cloudflare D1 Database
```javascript
// Create customers table
await env.DB.prepare(
  'INSERT INTO customers (email, username, registered_at) VALUES (?, ?, ?)'
).bind(email, username, timestamp).run();
```

### Option 3: External Database
- MongoDB
- PostgreSQL
- Firebase

---

## 📊 Current Setup

**Primary Storage:** Paylix Customers API ✅  
**Local File:** `data/customers.json` (manual updates)  
**Browser Storage:** localStorage (per-user sessions)  

**All customer registrations are saved in Paylix and can be accessed anytime!**

---

## 🔧 How to Export Customer Data

### From Paylix API:
```javascript
// Get all customers
const response = await fetch('https://dev.paylix.gg/v1/customers', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const data = await response.json();
const customers = data.data.customers;

// Export to CSV or JSON
console.log(JSON.stringify(customers, null, 2));
```

### From Admin Dashboard:
1. Login as admin
2. Go to Dashboard
3. Click "Export Customers" (to be added)
4. Download CSV/JSON file

---

## ✅ Summary

- ✅ All customers saved in Paylix Customers API
- ✅ Customer data includes email, name, username, password hash
- ✅ Registration timestamp tracked
- ✅ Accessible via Paylix Dashboard or API
- ✅ Admin can view/manage all customers
- ✅ Data persists across deployments

**Your customer data is safe and accessible!** 🎉
