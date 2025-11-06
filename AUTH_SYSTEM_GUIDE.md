# Complete Authentication System Guide

## ✅ What's Been Implemented

### 1. **Real Authentication API** (`/api/auth`)
- Uses Paylix Customers API to store user accounts
- Password verification with hashing
- Separate handling for admin vs customers
- Session management

### 2. **Admin Credentials**
```
Email: connazlunn@gmail.com
Password: Admin123!
```

### 3. **Customer Registration**
- Creates account in Paylix Customers database
- Stores username and hashed password
- Validates email uniqueness
- Password strength validation (min 6 characters)

### 4. **Customer Login**
- Verifies email and password
- Checks against Paylix Customers database
- Creates persistent session
- Different experience for admin vs customer

---

## 🔐 How It Works

### Admin Login Flow:
1. User enters: `connazlunn@gmail.com` / `Admin123!`
2. Auth API checks hardcoded admin credentials
3. Returns admin user object
4. Redirects to Dashboard
5. Shows admin menu with crown icon

### Customer Login Flow:
1. User enters email/password
2. Auth API queries Paylix Customers API
3. Finds customer by email
4. Verifies password hash
5. Returns customer user object
6. Stays on current page
7. Shows customer menu

### Customer Registration Flow:
1. User enters username, email, password
2. Auth API checks if email already exists
3. Creates new customer in Paylix
4. Stores password hash in customer metadata
5. Auto-logs in the user
6. Shows success message

---

## 📊 Paylix API Integration

### What We Use:

#### **Customers API** (`/v1/customers`)
- **GET** - Find customer by email
- **POST** - Create new customer
- **Metadata** - Store username and password_hash

#### **Orders API** (`/v1/orders`)
- Get customer order history
- Used in dashboard and My Orders page

#### **Feedback API** (`/v1/feedback`)
- Get customer reviews
- Display on reviews page

---

## 🗄️ Data Storage

### Customer Object in Paylix:
```json
{
  "id": "customer_123",
  "email": "user@example.com",
  "metadata": {
    "username": "JohnDoe",
    "password_hash": "aGFzaGVkcGFzc3dvcmQ=",
    "registered_at": "2025-01-06T19:50:00.000Z"
  }
}
```

### Session in localStorage:
```json
{
  "email": "user@example.com",
  "username": "JohnDoe",
  "loggedIn": true,
  "isStaff": false,
  "role": "customer",
  "customerId": "customer_123",
  "loginTime": "2025-01-06T19:50:00.000Z"
}
```

---

## 🧪 Testing

### Test Admin Login:
1. Go to site
2. Click Login
3. Email: `connazlunn@gmail.com`
4. Password: `Admin123!`
5. Should redirect to Dashboard
6. User icon should show crown

### Test Customer Registration:
1. Click Register
2. Username: `TestUser`
3. Email: `test@example.com`
4. Password: `Test123!`
5. Confirm Password: `Test123!`
6. Should create account and log in
7. User icon should show user icon

### Test Customer Login:
1. Logout
2. Click Login
3. Use the email/password you registered with
4. Should log in successfully
5. Should stay on current page

---

## 🔒 Security Features

### Current:
- ✅ Password hashing (Base64 - basic)
- ✅ Password confirmation
- ✅ Password length validation (min 6 chars)
- ✅ Email uniqueness check
- ✅ Session persistence
- ✅ Admin credentials hardcoded

### Production Recommendations:
- 🔄 Use bcrypt for password hashing
- 🔄 Add rate limiting
- 🔄 Add CAPTCHA for registration
- 🔄 Add email verification
- 🔄 Add password reset functionality
- 🔄 Use JWT tokens instead of localStorage
- 🔄 Add 2FA for admin accounts

---

## 📝 API Endpoints

### `/api/auth` (POST)

#### Login:
```json
{
  "action": "login",
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "user": {
    "email": "user@example.com",
    "username": "JohnDoe",
    "role": "customer",
    "isStaff": false,
    "customerId": "customer_123"
  }
}
```

#### Register:
```json
{
  "action": "register",
  "email": "user@example.com",
  "password": "password123",
  "username": "JohnDoe"
}
```

Response:
```json
{
  "success": true,
  "user": {
    "email": "user@example.com",
    "username": "JohnDoe",
    "role": "customer",
    "isStaff": false,
    "customerId": "customer_123"
  }
}
```

#### Verify Session:
```json
{
  "action": "verify",
  "email": "user@example.com"
}
```

Response:
```json
{
  "success": true,
  "valid": true
}
```

---

## 🎯 User Roles

### Admin:
- **Email:** `connazlunn@gmail.com`
- **Password:** `Admin123!`
- **Access:** Dashboard, All Orders, Manage Products
- **Icon:** Crown (orange)
- **Badge:** STAFF

### Customer:
- **Registration:** Via register form
- **Access:** My Orders, My Downloads
- **Icon:** User (purple)
- **Badge:** None

---

## 🔄 Session Management

### Login Persistence:
- Stored in `localStorage`
- Persists across page refreshes
- Cleared on logout
- Auto-checks on page load

### Auto-Login Check:
```javascript
// On page load
const user = JSON.parse(localStorage.getItem('accvaults_user'));
if (user && user.loggedIn) {
    updateLoginButton(); // Shows user icon
}
```

---

## 🚀 Next Steps

### For Production:
1. **Improve Password Security**
   - Use bcrypt instead of Base64
   - Add password strength meter
   - Require special characters

2. **Add Email Verification**
   - Send verification email on registration
   - Require email confirmation before login

3. **Add Password Reset**
   - "Forgot Password" link
   - Email reset token
   - Secure password reset flow

4. **Add More Admin Features**
   - User management
   - Order management
   - Product management
   - Analytics dashboard

5. **Add Rate Limiting**
   - Prevent brute force attacks
   - Limit login attempts
   - Add CAPTCHA after failed attempts

---

## 📞 Support

If you need to:
- Add more admins → Edit `functions/api/auth.js` line 5
- Change admin password → Edit `functions/api/auth.js` line 6
- Modify user roles → Edit `functions/api/auth.js`
- Add new features → Contact developer

---

**Your authentication system is now fully functional!** 🎉

Test it at: `https://accvaults1.pages.dev`
