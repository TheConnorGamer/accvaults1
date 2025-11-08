// Custom Ticket System - Reply to Ticket

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
        const { ticketId, message, senderType = 'customer', senderEmail } = body;
        
        if (!ticketId || !message) {
            return new Response(JSON.stringify({ 
                error: 'Missing required fields',
                required: ['ticketId', 'message']
            }), {
                status: 400,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        
        // Check if ticket exists
        const { results: tickets } = await env.DB.prepare(
            'SELECT * FROM tickets WHERE ticket_id = ?'
        ).bind(ticketId).all();
        
        if (tickets.length === 0) {
            return new Response(JSON.stringify({ 
                error: 'Ticket not found'
            }), {
                status: 404,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        
        const timestamp = Math.floor(Date.now() / 1000);
        
        // Insert reply message
        await env.DB.prepare(
            'INSERT INTO ticket_messages (ticket_id, sender_type, sender_email, message, created_at) VALUES (?, ?, ?, ?, ?)'
        ).bind(ticketId, senderType, senderEmail, message, timestamp).run();
        
        // Update ticket's updated_at timestamp
        await env.DB.prepare(
            'UPDATE tickets SET updated_at = ? WHERE ticket_id = ?'
        ).bind(timestamp, ticketId).run();
        
        console.log('✅ Reply added to ticket:', ticketId);
        
        // Send email notification if admin replied
        if (senderType === 'support') {
            try {
                const emailApiKey = env.RESEND_API_KEY;
                const customerEmail = tickets[0].customer_email;
                const ticketSubject = tickets[0].subject;
                
                if (emailApiKey && customerEmail) {
                    await fetch('https://api.resend.com/emails', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${emailApiKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            from: 'AccVaults Support <support@tickets.accvaults.com>',
                            to: [customerEmail],
                            subject: `New Reply to Your Ticket: ${ticketSubject}`,
                            text: `Hello,

You have received a new reply from our support team.

Ticket ID: #${ticketId}
Subject: ${ticketSubject}

Reply from Support:
${message}

Continue the conversation at: https://shop.accvaults.com/tickets

Thank you,
AccVaults Support Team
Customer Support
AccVaults - Premium Digital Services
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
        .logo { width: 60px; height: 60px; margin: 0 auto 16px; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; color: #ffffff !important; }
        .content { padding: 40px 30px; background: #ffffff; }
        .ticket-card { background: #f8f9fa; border: 1px solid #e5e5e5; border-radius: 12px; padding: 24px; margin: 24px 0; }
        .ticket-card h2 { margin: 0 0 16px 0; font-size: 18px; color: #8359cf !important; font-weight: 600; }
        .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e5e5; }
        .info-row:last-child { border-bottom: none; }
        .reply-box { background: #f8f9fa; border: 1px solid #e5e5e5; border-left: 4px solid #8359cf; padding: 20px; margin: 24px 0; border-radius: 8px; }
        .reply-box .badge { display: inline-block; background: #8359cf; color: white !important; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #8359cf 0%, #6b47b8 100%); color: #ffffff !important; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; margin: 24px 0; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e5e5e5; }
        .footer .signature-title { color: #8359cf !important; }
        .footer a { color: #8359cf !important; text-decoration: none; font-weight: 600; }
        .divider { height: 1px; background: #e5e5e5; margin: 30px 0; }
        @media (prefers-color-scheme: dark) {
            body { background: #0b0b0b !important; color: #ffffff !important; }
            .email-container { background: #1a1a1a !important; border-color: rgba(131, 89, 207, 0.3) !important; }
            .content { background: #1a1a1a !important; }
            .ticket-card { background: rgba(131, 89, 207, 0.1) !important; border-color: rgba(131, 89, 207, 0.3) !important; }
            .reply-box { background: rgba(131, 89, 207, 0.15) !important; border-color: rgba(131, 89, 207, 0.3) !important; }
            .footer { background: #0f0f0f !important; border-color: rgba(131, 89, 207, 0.2) !important; }
            .info-row { border-color: rgba(255,255,255,0.1) !important; }
            .divider { background: rgba(131, 89, 207, 0.5) !important; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://shop.accvaults.com/images/logo.png" alt="AccVaults" class="logo" />
            <h1>💬 New Reply</h1>
        </div>
        <div class="content">
            <p style="font-size: 17px; margin-bottom: 24px; font-weight: 500;">Hello,</p>
            <p style="margin-bottom: 24px; font-size: 15px; line-height: 1.8;">You have received a new reply from our support team.</p>
            
            <div class="ticket-card">
                <h2>📋 Ticket Information</h2>
                <div class="info-row">
                    <span style="font-size: 14px; color: #666;">Ticket ID</span>
                    <span style="font-size: 15px; font-weight: 600; color: #1a1a1a;">#${ticketId}</span>
                </div>
                <div class="info-row">
                    <span style="font-size: 14px; color: #666;">Subject</span>
                    <span style="font-size: 15px; font-weight: 600; color: #1a1a1a;">${ticketSubject}</span>
                </div>
            </div>
            
            <div class="reply-box">
                <div class="badge">🛡️ SUPPORT TEAM</div>
                <p style="font-size: 15px; line-height: 1.8; margin-top: 12px; color: #1a1a1a;">${message}</p>
            </div>
            
            <div class="divider"></div>
            
            <p style="text-align: center; margin: 24px 0; font-size: 15px;">Continue the conversation:</p>
            <center>
                <a href="https://shop.accvaults.com/tickets" class="cta-button">Reply to Ticket</a>
            </center>
        </div>
        <div class="footer">
            <div class="signature">
                <div class="signature-name">AccVaults Support Team</div>
                <div class="signature-title">Customer Support</div>
                <div class="signature-company">AccVaults - Premium Digital Services</div>
            </div>
            <p style="color: #666; font-size: 13px; margin: 16px 0;">We're here to help 24/7</p>
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
                // Don't fail the reply if email fails
            }
        }
        
        return new Response(JSON.stringify({
            success: true,
            message: 'Reply added successfully',
            data: {
                ticket_id: ticketId,
                sender_type: senderType,
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
        console.error('Error adding reply:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to add reply',
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
