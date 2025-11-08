# D1 Database Ticket System - Complete Guide

## 🎉 What's Been Built

A **fully functional ticket system** using Cloudflare D1 database with:
- ✅ Customer ticket creation
- ✅ View tickets by email
- ✅ Reply to tickets (customer & admin)
- ✅ Close/reopen tickets
- ✅ Email notifications (when configured)
- ✅ Beautiful modern UI
- ✅ Admin panel ready

---

## 📁 File Structure

### Backend API Endpoints (`/functions/api/tickets-v2/`)
- **`create.js`** - Create new tickets
- **`list.js`** - List tickets by email
- **`[id].js`** - Get ticket details with messages
- **`reply.js`** - Reply to tickets
- **`close.js`** - Close tickets
- **`reopen.js`** - Reopen closed tickets
- **`admin/all.js`** - Admin: Get all tickets

### Frontend Files
- **`tickets.html`** - Customer ticket management page
- **`js/tickets.js`** - Frontend JavaScript logic
- **`contact.html`** - Updated with ticket system link

---

## 🚀 How It Works

### For Customers:
1. Go to `https://shop.accvaults.com/tickets.html`
2. **Create Ticket** tab:
   - Enter email, subject, and message
   - Submit → Ticket created in D1 database
   - Receive email confirmation (if configured)
3. **My Tickets** tab:
   - Enter email to view all tickets
   - Click ticket to view details
   - Reply to tickets
   - Close tickets when resolved

### For Admins:
1. Go to `https://shop.accvaults.com/admin-tickets.html`
2. View all tickets from all customers
3. Reply to tickets (customers get email notification)
4. Close/reopen tickets
5. Track ticket status

---

## 📧 Email Notifications Setup

### Step 1: Get Resend API Key
1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Get your API key from dashboard

### Step 2: Add to Cloudflare
1. Go to **Cloudflare Dashboard**
2. Navigate to **Workers & Pages** → **accvaults1**
3. Go to **Settings** → **Environment Variables**
4. Click **Add Variable**
   - Name: `RESEND_API_KEY`
   - Value: `re_xxxxxxxxxxxxx` (your Resend API key)
5. Click **Save**

### Step 3: Verify Domain (Optional but Recommended)
1. In Resend dashboard, add your domain `accvaults.com`
2. Add DNS records they provide
3. Update email `from` address in:
   - `functions/api/tickets-v2/create.js` (line 78)
   - `functions/api/tickets-v2/reply.js` (line 79)
   - Change from: `support@accvaults.com` to your verified domain

### Email Triggers:
- ✅ **Customer creates ticket** → Customer gets confirmation email
- ✅ **Admin replies** → Customer gets notification email
- ❌ **Customer replies** → No email (to avoid spam)

---

## 🗄️ Database Schema

The D1 database has 2 tables:

### `tickets` Table
```sql
CREATE TABLE tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT UNIQUE NOT NULL,
    customer_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    priority TEXT DEFAULT 'normal',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);
```

### `ticket_messages` Table
```sql
CREATE TABLE ticket_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT NOT NULL,
    sender_type TEXT NOT NULL,
    sender_email TEXT,
    message TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
);
```

---

## 🔧 API Endpoints

### Customer Endpoints

#### Create Ticket
```
POST /api/tickets-v2/create
Body: {
  "email": "customer@example.com",
  "subject": "Need help",
  "message": "Description of issue"
}
```

#### List Tickets
```
GET /api/tickets-v2/list?email=customer@example.com
```

#### Get Ticket Details
```
GET /api/tickets-v2/TKT-1234567890-ABC123
```

#### Reply to Ticket
```
POST /api/tickets-v2/reply
Body: {
  "ticketId": "TKT-1234567890-ABC123",
  "message": "My reply",
  "senderType": "customer",
  "senderEmail": "customer@example.com"
}
```

#### Close Ticket
```
POST /api/tickets-v2/close
Body: {
  "ticketId": "TKT-1234567890-ABC123"
}
```

#### Reopen Ticket
```
POST /api/tickets-v2/reopen
Body: {
  "ticketId": "TKT-1234567890-ABC123"
}
```

### Admin Endpoints

#### Get All Tickets
```
GET /api/tickets-v2/admin/all
```

---

## 🎨 Customization

### Change Ticket ID Format
Edit `functions/api/tickets-v2/create.js` line 4:
```javascript
function generateTicketId() {
    return 'TKT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}
```

### Change Email Template
Edit email HTML in:
- `functions/api/tickets-v2/create.js` (lines 81-92)
- `functions/api/tickets-v2/reply.js` (lines 82-93)

### Add Priority Levels
Update the create endpoint to accept priority:
```javascript
const { email, subject, message, priority = 'normal' } = body;
```

---

## 🧪 Testing

### Test Ticket Creation
1. Go to `https://shop.accvaults.com/tickets.html`
2. Fill out the form
3. Submit
4. Check if ticket appears in "My Tickets"

### Test Email Notifications
1. Add `RESEND_API_KEY` to Cloudflare
2. Create a ticket with your real email
3. Check your inbox for confirmation

### Test Admin Functions
1. Go to `https://shop.accvaults.com/admin-tickets.html`
2. View all tickets
3. Reply to a ticket
4. Customer should receive email

---

## 🔒 Security Notes

- ✅ API keys stored securely in environment variables
- ✅ CORS properly configured
- ✅ Input validation on all endpoints
- ✅ Email validation
- ✅ SQL injection protection (parameterized queries)
- ⚠️ **No authentication** - Anyone with email can view their tickets
  - Consider adding password/token system for production

---

## 📊 Monitoring

### View Logs
```bash
npx wrangler pages deployment tail --project-name=accvaults1
```

### Check Database
```bash
npx wrangler d1 execute accvaults_users --command "SELECT * FROM tickets ORDER BY created_at DESC LIMIT 10"
```

---

## 🚨 Troubleshooting

### Tickets not showing up?
- Check browser console for errors
- Verify email is correct
- Check D1 database directly

### Emails not sending?
- Verify `RESEND_API_KEY` is set in Cloudflare
- Check Resend dashboard for delivery status
- Look at Cloudflare logs for errors

### Database errors?
- Ensure D1 binding is correct in `wrangler.toml`
- Check if tables exist
- Verify database ID matches

---

## 📝 Next Steps

### Recommended Improvements:
1. **Add authentication** - Require login to view tickets
2. **File attachments** - Allow customers to upload images
3. **Ticket categories** - Add dropdown for issue types
4. **Auto-close** - Close tickets after X days of inactivity
5. **Ticket ratings** - Let customers rate support quality
6. **Search functionality** - Search tickets by keyword
7. **Admin notifications** - Email admins when new ticket created

---

## 🎯 Current Status

✅ **FULLY FUNCTIONAL** - Ready to use!

- Deployed to: `https://shop.accvaults.com/tickets.html`
- Database: Cloudflare D1 (`accvaults_users`)
- Email: Ready (needs `RESEND_API_KEY`)
- Admin panel: `https://shop.accvaults.com/admin-tickets.html`

---

## 📞 Support

If you need help:
1. Check logs: `npx wrangler pages deployment tail`
2. Test endpoints directly with Postman/curl
3. Check database: `npx wrangler d1 execute accvaults_users --command "SELECT COUNT(*) FROM tickets"`

---

**Built with ❤️ using Cloudflare D1, Workers, and Pages**
