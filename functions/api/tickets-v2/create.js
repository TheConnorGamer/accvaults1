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
                        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.8; color: #ffffff; background: #0b0b0b; margin: 0; padding: 20px; }
        .email-container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(131, 89, 207, 0.3); border: 1px solid rgba(131, 89, 207, 0.2); }
        .header { background: linear-gradient(135deg, #8359cf 0%, #6b47b8 100%); padding: 40px 30px; text-align: center; position: relative; }
        .header::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #8359cf, #6b47b8, #8359cf); }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; text-shadow: 0 2px 8px rgba(0,0,0,0.3); }
        .header .icon { font-size: 48px; margin-bottom: 10px; }
        .content { padding: 40px 30px; }
        .ticket-card { background: rgba(131, 89, 207, 0.1); border: 1px solid rgba(131, 89, 207, 0.3); border-radius: 12px; padding: 24px; margin: 24px 0; }
        .ticket-card h2 { margin: 0 0 16px 0; font-size: 18px; color: #8359cf; font-weight: 600; }
        .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .info-row:last-child { border-bottom: none; }
        .info-label { color: #d4d4d4; font-size: 14px; font-weight: 500; }
        .info-value { color: #ffffff; font-weight: 600; font-size: 15px; }
        .message-box { background: rgba(131, 89, 207, 0.15); border: 1px solid rgba(131, 89, 207, 0.3); border-left: 4px solid #8359cf; padding: 20px; margin: 24px 0; border-radius: 8px; }
        .message-box p { margin: 0; color: #ffffff; line-height: 1.8; font-size: 15px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #8359cf 0%, #6b47b8 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; margin: 24px 0; box-shadow: 0 4px 16px rgba(131, 89, 207, 0.4); transition: all 0.3s; }
        .cta-button:hover { box-shadow: 0 6px 20px rgba(131, 89, 207, 0.6); transform: translateY(-2px); }
        .footer { background: #0f0f0f; padding: 30px; text-align: center; border-top: 1px solid rgba(131, 89, 207, 0.2); }
        .footer p { margin: 8px 0; color: #d4d4d4; font-size: 14px; }
        .footer a { color: #8359cf; text-decoration: none; font-weight: 600; }
        .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(131, 89, 207, 0.5), transparent); margin: 30px 0; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="icon">🎫</div>
            <h1>Ticket Created Successfully</h1>
        </div>
        <div class="content">
            <p style="font-size: 17px; color: #f0f0f0; margin-bottom: 24px; font-weight: 500;">Hello,</p>
            <p style="color: #d4d4d4; margin-bottom: 24px; font-size: 15px; line-height: 1.8;">Your support ticket has been created and our team will respond as soon as possible.</p>
            
            <div class="ticket-card">
                <h2>📋 Ticket Details</h2>
                <div class="info-row">
                    <span class="info-label">Ticket ID</span>
                    <span class="info-value">#${ticketId}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Subject</span>
                    <span class="info-value">${subject}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Status</span>
                    <span class="info-value" style="color: #10b981;">Open</span>
                </div>
            </div>
            
            <div class="message-box">
                <p><strong style="color: #8359cf;">Your Message:</strong></p>
                <p style="margin-top: 12px;">${message}</p>
            </div>
            
            <div class="divider"></div>
            
            <p style="color: #d4d4d4; text-align: center; margin: 24px 0; font-size: 15px;">View and manage your ticket anytime:</p>
            <center>
                <a href="https://shop.accvaults.com/tickets" class="cta-button">View My Tickets</a>
            </center>
        </div>
        <div class="footer">
            <p><strong style="color: #ffffff;">AccVaults Support Team</strong></p>
            <p>We're here to help 24/7</p>
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
