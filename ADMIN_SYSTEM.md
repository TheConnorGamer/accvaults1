# Admin/Staff System - Complete Guide

## ✅ What Was Added

### 1. **Staff Role System**
- Staff/Admin accounts are now supported
- Different menu for staff vs regular customers
- Auto-redirect to dashboard for staff

### 2. **Admin Email List**
Add your admin emails to this list in `js/main.js` (line 1166):

```javascript
const staffEmails = ['conazukin@gmail.com', 'admin@accvaults.com', 'staff@accvaults.com'];
```

**Your email `conazukin@gmail.com` is already added as admin!**

### 3. **Staff Features**
When logged in as staff, you get:
- ✅ **Dashboard** - Analytics and stats
- ✅ **All Orders** - View all customer orders
- ✅ **Manage Products** - Product management
- ✅ **Crown icon** - Shows you're staff
- ✅ **STAFF badge** - Orange badge in menu
- ✅ **Auto-redirect** - Goes to dashboard on login

### 4. **Customer Features**
Regular customers get:
- ✅ **My Orders** - Their own orders
- ✅ **My Downloads** - Their downloads
- ✅ **User icon** - Regular user icon

---

## 🔐 How to Login as Admin

1. **Go to your site:** `https://accvaults1.pages.dev`
2. **Click login button** (top right)
3. **Enter your email:** `conazukin@gmail.com`
4. **Enter any password** (password not checked yet)
5. **Click Login**
6. **You'll be redirected to Dashboard!**

---

## 📊 Dashboard Features

The dashboard shows:
- **Total Orders** - All orders from Paylix
- **Total Revenue** - Sum of all completed orders
- **Total Products** - Number of products
- **Total Customers** - Unique customers
- **Recent Orders** - Latest orders list

---

## 🎨 Staff Menu vs Customer Menu

### Staff Menu (Orange Crown Icon):
```
👑 Admin
conazukin@gmail.com
[STAFF]

📊 Dashboard
📦 All Orders
🛍️ Manage Products
🚪 Logout
```

### Customer Menu (Purple User Icon):
```
👤 User
customer@email.com

📦 My Orders
💾 My Downloads
🚪 Logout
```

---

## ➕ How to Add More Admins

Edit `js/main.js` line 1166:

```javascript
const staffEmails = [
    'conazukin@gmail.com',      // Your email
    'admin@accvaults.com',       // Admin email
    'staff@accvaults.com',       // Staff email
    'newemail@example.com'       // Add new admin here
];
```

Then commit and push:
```bash
git add .
git commit -m "Added new admin email"
git push
```

---

## 🔧 Login System Improvements

### What Was Fixed:
1. **Persistent Login** - Stays logged in across page refreshes
2. **Role Detection** - Knows if you're staff or customer
3. **Auto-Redirect** - Staff go to dashboard, customers stay on current page
4. **Better Error Messages** - Clear feedback on login issues

### How Login Works:
1. **Staff Login:**
   - Checks if email is in staff list
   - No order check needed
   - Sets `isStaff: true` and `role: 'admin'`
   - Redirects to dashboard

2. **Customer Login:**
   - Checks if they have orders in Paylix
   - If yes, logs them in
   - Sets `isStaff: false` and `role: 'customer'`
   - Stays on current page

---

## 📝 Stored User Data

When you login, this is saved in localStorage:

### Staff:
```json
{
  "email": "conazukin@gmail.com",
  "loggedIn": true,
  "isStaff": true,
  "role": "admin",
  "loginTime": "2025-01-06T19:47:00.000Z"
}
```

### Customer:
```json
{
  "email": "customer@email.com",
  "loggedIn": true,
  "isStaff": false,
  "role": "customer",
  "loginTime": "2025-01-06T19:47:00.000Z"
}
```

---

## 🚀 Testing

### Test Staff Login:
1. Open site in incognito/private window
2. Click login
3. Use: `conazukin@gmail.com`
4. Should redirect to dashboard
5. Click user icon - should show STAFF badge

### Test Customer Login:
1. Use a different email that has orders
2. Should stay on current page
3. Click user icon - should show My Orders

---

## 🎯 Next Steps

You can now:
1. ✅ Login as admin with your email
2. ✅ Access the dashboard
3. ✅ View all orders
4. ✅ Manage products
5. ✅ Add more admin emails as needed

**Your admin account is ready to use!** 🎉
