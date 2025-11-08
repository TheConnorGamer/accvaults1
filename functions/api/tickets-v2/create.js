// Custom Ticket System - Create Ticket

function generateTicketId() {
    return 'TKT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}

export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const body = await request.json();
        const { email, subject, message } = body;
        
        // Validate input
        if (!email || !subject || !message) {
            return new Response(JSON.stringify({ 
                error: 'Missing required fields',
                required: ['email', 'subject', 'message']
            }), {
                status: 400,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return new Response(JSON.stringify({ 
                error: 'Invalid email format'
            }), {
                status: 400,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        
        const ticketId = generateTicketId();
        const timestamp = Math.floor(Date.now() / 1000);
        
        // Insert ticket into database
        await env.DB.prepare(
            'INSERT INTO tickets (ticket_id, customer_email, subject, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(ticketId, email, subject, 'open', 'normal', timestamp, timestamp).run();
        
        // Insert initial message
        await env.DB.prepare(
            'INSERT INTO ticket_messages (ticket_id, sender_type, sender_email, message, created_at) VALUES (?, ?, ?, ?, ?)'
        ).bind(ticketId, 'customer', email, message, timestamp).run();
        
        console.log('✅ Ticket created:', ticketId);
        
        // Send email notification to customer
        try {
            const emailApiKey = env.RESEND_API_KEY;
            if (emailApiKey) {
                await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${emailApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: 'AccVaults Support <support@tickets.accvaults.com>',
                        to: [email],
                        subject: `Ticket Created: ${subject}`,
                        text: `Hello,

Your support ticket has been created and our team will respond as soon as possible.

Ticket ID: #${ticketId}
Subject: ${subject}
Status: Open

Your Message:
${message}

View and manage your ticket at: https://shop.accvaults.com/tickets

Thank you,
AccVaults Support Team
shop.accvaults.com`,
                        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.8; color: #1a1a1a; background: #f5f5f5; margin: 0; padding: 20px; }
        .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1); border: 1px solid #e5e5e5; }
        .header { background: linear-gradient(135deg, #8359cf 0%, #6b47b8 100%); padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; color: #ffffff !important; }
        .header .icon { font-size: 48px; margin-bottom: 10px; }
        .content { padding: 40px 30px; background: #ffffff; }
        .ticket-card { background: #f8f9fa; border: 1px solid #e5e5e5; border-radius: 12px; padding: 24px; margin: 24px 0; }
        .ticket-card h2 { margin: 0 0 16px 0; font-size: 18px; color: #8359cf !important; font-weight: 600; }
        .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e5e5; }
        .info-row:last-child { border-bottom: none; }
        .message-box { background: #f8f9fa; border: 1px solid #e5e5e5; border-left: 4px solid #8359cf; padding: 20px; margin: 24px 0; border-radius: 8px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #8359cf 0%, #6b47b8 100%); color: #ffffff !important; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; margin: 24px 0; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e5e5e5; }
        .footer a { color: #8359cf !important; text-decoration: none; font-weight: 600; }
        .divider { height: 1px; background: #e5e5e5; margin: 30px 0; }
        @media (prefers-color-scheme: dark) {
            body { background: #0b0b0b !important; color: #ffffff !important; }
            .email-container { background: #1a1a1a !important; border-color: rgba(131, 89, 207, 0.3) !important; }
            .content { background: #1a1a1a !important; }
            .ticket-card { background: rgba(131, 89, 207, 0.1) !important; border-color: rgba(131, 89, 207, 0.3) !important; }
            .message-box { background: rgba(131, 89, 207, 0.15) !important; border-color: rgba(131, 89, 207, 0.3) !important; }
            .footer { background: #0f0f0f !important; border-color: rgba(131, 89, 207, 0.2) !important; }
            .info-row { border-color: rgba(255,255,255,0.1) !important; }
            .divider { background: rgba(131, 89, 207, 0.5) !important; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="icon">🎫</div>
            <h1>Ticket Created Successfully</h1>
        </div>
        <div class="content">
            <p style="font-size: 17px; margin-bottom: 24px; font-weight: 500;">Hello,</p>
            <p style="margin-bottom: 24px; font-size: 15px; line-height: 1.8;">Your support ticket has been created and our team will respond as soon as possible.</p>
            
            <div class="ticket-card">
                <h2>📋 Ticket Details</h2>
                <div class="info-row">
                    <span style="font-size: 14px; color: #666;">Ticket ID</span>
                    <span style="font-size: 15px; font-weight: 600; color: #1a1a1a;">#${ticketId}</span>
                </div>
                <div class="info-row">
                    <span style="font-size: 14px; color: #666;">Subject</span>
                    <span style="font-size: 15px; font-weight: 600; color: #1a1a1a;">${subject}</span>
                </div>
                <div class="info-row">
                    <span style="font-size: 14px; color: #666;">Status</span>
                    <span style="font-size: 15px; font-weight: 600; color: #10b981;">Open</span>
                </div>
            </div>
            
            <div class="message-box">
                <p><strong style="color: #8359cf; font-size: 14px;">Your Message:</strong></p>
                <p style="margin-top: 12px; font-size: 15px; line-height: 1.8; color: #1a1a1a;">${message}</p>
            </div>
            
            <div class="divider"></div>
            
            <p style="text-align: center; margin: 24px 0; font-size: 15px;">View and manage your ticket anytime:</p>
            <center>
                <a href="https://shop.accvaults.com/tickets" class="cta-button">View My Tickets</a>
            </center>
        </div>
        <div class="footer">
            <p><strong>AccVaults Support Team</strong></p>
            <p style="color: #666;">We're here to help 24/7</p>
            <p><a href="https://shop.accvaults.com">shop.accvaults.com</a></p>
        </div>
    </div>
</body>
</html>`
                    })
                });
                console.log('✅ Email sent to customer');
            }
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
            // Don't fail the ticket creation if email fails
        }
        
        return new Response(JSON.stringify({
            success: true,
            message: 'Ticket created successfully',
            data: {
                ticket_id: ticketId,
                customer_email: email,
                subject: subject,
                status: 'open',
                created_at: timestamp
            }
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
        
    } catch (error) {
        console.error('Error creating ticket:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to create ticket',
            details: error.message
        }), {
            status: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}
