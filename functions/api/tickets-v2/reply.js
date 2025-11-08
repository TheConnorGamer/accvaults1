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
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.8; color: #ffffff; background: #0b0b0b; margin: 0; padding: 20px; }
        .email-container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(131, 89, 207, 0.3); border: 1px solid rgba(131, 89, 207, 0.2); }
        .header { background: linear-gradient(135deg, #8359cf 0%, #6b47b8 100%); padding: 40px 30px; text-align: center; position: relative; }
        .header::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #8359cf, #6b47b8, #8359cf); }
        .logo { width: 60px; height: 60px; margin: 0 auto 16px; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; text-shadow: 0 2px 8px rgba(0,0,0,0.3); }
        .header .icon { font-size: 48px; margin-bottom: 10px; }
        .content { padding: 40px 30px; }
        .ticket-card { background: rgba(131, 89, 207, 0.1); border: 1px solid rgba(131, 89, 207, 0.3); border-radius: 12px; padding: 24px; margin: 24px 0; }
        .ticket-card h2 { margin: 0 0 16px 0; font-size: 18px; color: #8359cf; font-weight: 600; }
        .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .info-row:last-child { border-bottom: none; }
        .info-label { color: #d4d4d4; font-size: 14px; font-weight: 500; }
        .info-value { color: #ffffff; font-weight: 600; font-size: 15px; }
        .reply-box { background: rgba(131, 89, 207, 0.15); border: 1px solid rgba(131, 89, 207, 0.3); border-radius: 12px; padding: 24px; margin: 24px 0; }
        .reply-box .badge { display: inline-block; background: #8359cf; color: white; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
        .reply-box p { margin: 12px 0 0 0; color: #ffffff; line-height: 1.8; font-size: 15px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #8359cf 0%, #6b47b8 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; margin: 24px 0; box-shadow: 0 4px 16px rgba(131, 89, 207, 0.4); }
        .footer { background: #0f0f0f; padding: 30px; text-align: center; border-top: 1px solid rgba(131, 89, 207, 0.2); }
        .footer .signature { margin: 20px 0; }
        .footer .signature-name { color: #ffffff; font-weight: 700; font-size: 16px; margin-bottom: 4px; }
        .footer .signature-title { color: #8359cf; font-size: 14px; margin-bottom: 8px; }
        .footer .signature-company { color: #d4d4d4; font-size: 14px; }
        .footer a { color: #8359cf; text-decoration: none; font-weight: 600; }
        .footer p { color: #d4d4d4; }
        .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(131, 89, 207, 0.5), transparent); margin: 30px 0; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://shop.accvaults.com/images/logo.png" alt="AccVaults" class="logo" />
            <h1>💬 New Reply</h1>
        </div>
        <div class="content">
            <p style="font-size: 17px; color: #f0f0f0; margin-bottom: 24px; font-weight: 500;">Hello,</p>
            <p style="color: #d4d4d4; margin-bottom: 24px; font-size: 15px; line-height: 1.8;">You have received a new reply from our support team.</p>
            
            <div class="ticket-card">
                <h2>📋 Ticket Information</h2>
                <div class="info-row">
                    <span class="info-label" style="color: #d4d4d4; font-size: 14px;">Ticket ID</span>
                    <span class="info-value" style="color: #ffffff; font-size: 15px; font-weight: 600;">#${ticketId}</span>
                </div>
                <div class="info-row">
                    <span class="info-label" style="color: #d4d4d4; font-size: 14px;">Subject</span>
                    <span class="info-value" style="color: #ffffff; font-size: 15px; font-weight: 600;">${ticketSubject}</span>
                </div>
            </div>
            
            <div class="reply-box">
                <div class="badge">🛡️ SUPPORT TEAM</div>
                <p style="color: #ffffff; font-size: 15px; line-height: 1.8; margin-top: 12px;">${message}</p>
            </div>
            
            <div class="divider"></div>
            
            <p style="color: #d4d4d4; text-align: center; margin: 24px 0; font-size: 15px;">Continue the conversation:</p>
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
            <p style="color: #b4b4b4; font-size: 13px; margin: 16px 0;">We're here to help 24/7</p>
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
