// Custom Ticket System - Close Ticket

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
        const { ticketId } = body;
        
        if (!ticketId) {
            return new Response(JSON.stringify({ 
                error: 'Ticket ID required'
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
        const ticket = tickets[0];
        
        // Get all messages for the transcript
        const { results: messages } = await env.DB.prepare(
            'SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC'
        ).bind(ticketId).all();
        
        // Update ticket status to closed
        await env.DB.prepare(
            'UPDATE tickets SET status = ?, updated_at = ? WHERE ticket_id = ?'
        ).bind('closed', timestamp, ticketId).run();
        
        // Generate transcript
        let transcript = `Ticket #${ticketId} - ${ticket.subject}\n`;
        transcript += `Customer: ${ticket.customer_email}\n`;
        transcript += `Created: ${new Date(ticket.created_at * 1000).toLocaleString()}\n`;
        transcript += `Closed: ${new Date(timestamp * 1000).toLocaleString()}\n\n`;
        transcript += `=== CONVERSATION ===\n\n`;
        
        // Add initial message
        transcript += `[${new Date(ticket.created_at * 1000).toLocaleString()}] Customer:\n${ticket.message}\n\n`;
        
        // Add all replies
        for (const msg of messages) {
            const sender = msg.sender_type === 'support' ? 'Support Team' : 'Customer';
            transcript += `[${new Date(msg.created_at * 1000).toLocaleString()}] ${sender}:\n${msg.message}\n\n`;
        }
        
        // Send transcript email to admin
        try {
            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'AccVaults Support <support@tickets.accvaults.com>',
                    to: 'connazlunn@gmail.com', // Admin email
                    subject: `Ticket Closed: #${ticketId} - ${ticket.subject}`,
                    text: transcript
                })
            });
        } catch (emailError) {
            console.error('Failed to send admin transcript email:', emailError);
        }
        
        // Send closure notification email to customer with transcript
        try {
            // Create HTML transcript file
            const htmlTranscript = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ticket Transcript - #${ticketId}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #ffffff; background: #0b0b0b; margin: 0; padding: 40px 20px; }
        .transcript-container { max-width: 800px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(131, 89, 207, 0.3); border: 1px solid rgba(131, 89, 207, 0.2); }
        .header { background: linear-gradient(135deg, #8359cf 0%, #6b47b8 100%); padding: 40px; text-align: center; }
        .header img { width: 80px; height: 80px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; }
        .header p { margin: 8px 0 0 0; color: rgba(255,255,255,0.8); font-size: 16px; }
        .content { padding: 40px; }
        .ticket-info { background: rgba(131, 89, 207, 0.1); border: 1px solid rgba(131, 89, 207, 0.3); border-radius: 12px; padding: 30px; margin-bottom: 30px; }
        .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .info-item { }
        .info-label { color: #8359cf; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
        .info-value { color: #ffffff; font-size: 16px; font-weight: 600; }
        .status-closed { color: #dc2626; }
        .conversation { margin-top: 40px; }
        .conversation h2 { color: #8359cf; font-size: 24px; margin-bottom: 24px; }
        .message { background: rgba(20, 20, 20, 0.6); border-radius: 12px; padding: 24px; margin-bottom: 20px; border-left: 4px solid #8359cf; }
        .message.support { border-left-color: #10b981; }
        .message-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .message-sender { font-weight: 700; color: #8359cf; font-size: 14px; }
        .message.support .message-sender { color: #10b981; }
        .message-time { color: #b4b4b4; font-size: 13px; }
        .message-content { color: #e0e0e0; line-height: 1.8; font-size: 15px; }
        .footer { background: rgba(20, 20, 20, 0.5); padding: 30px; text-align: center; border-top: 1px solid rgba(131, 89, 207, 0.2); }
        .footer p { margin: 8px 0; color: #b4b4b4; font-size: 14px; }
    </style>
</head>
<body>
    <div class="transcript-container">
        <div class="header">
            <img src="https://shop.accvaults.com/images/logo.png" alt="AccVaults" />
            <h1>Ticket Transcript</h1>
            <p>Complete conversation history</p>
        </div>
        <div class="content">
            <div class="ticket-info">
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Ticket ID</div>
                        <div class="info-value">#${ticketId}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Status</div>
                        <div class="info-value status-closed">Closed</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Subject</div>
                        <div class="info-value">${ticket.subject}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Customer</div>
                        <div class="info-value">${ticket.customer_email}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Created</div>
                        <div class="info-value">${new Date(ticket.created_at * 1000).toLocaleString()}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Closed</div>
                        <div class="info-value">${new Date(timestamp * 1000).toLocaleString()}</div>
                    </div>
                </div>
            </div>
            
            <div class="conversation">
                <h2>💬 Conversation History</h2>
                
                <div class="message">
                    <div class="message-header">
                        <span class="message-sender">👤 Customer</span>
                        <span class="message-time">${new Date(ticket.created_at * 1000).toLocaleString()}</span>
                    </div>
                    <div class="message-content">${ticket.message}</div>
                </div>
                
                ${messages.map(msg => `
                    <div class="message ${msg.sender_type === 'support' ? 'support' : ''}">
                        <div class="message-header">
                            <span class="message-sender">${msg.sender_type === 'support' ? '🛡️ Support Team' : '👤 Customer'}</span>
                            <span class="message-time">${new Date(msg.created_at * 1000).toLocaleString()}</span>
                        </div>
                        <div class="message-content">${msg.message}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="footer">
            <p><strong style="color: #ffffff;">AccVaults Support Team</strong></p>
            <p>AccVaults - Premium Digital Services</p>
            <p style="color: #8359cf;">shop.accvaults.com</p>
        </div>
    </div>
</body>
</html>`;
            
            // Create HTML email (notification only - transcript is attached)
            const customerEmailHTML = `
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
        .content { padding: 40px 30px; }
        .ticket-card { background: rgba(131, 89, 207, 0.1); border: 1px solid rgba(131, 89, 207, 0.3); border-radius: 12px; padding: 24px; margin: 24px 0; }
        .ticket-card h2 { margin: 0 0 16px 0; font-size: 18px; color: #8359cf; font-weight: 600; }
        .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .info-row:last-child { border-bottom: none; }
        .info-label { color: #d4d4d4; font-size: 14px; font-weight: 500; }
        .info-value { color: #ffffff; font-weight: 600; font-size: 15px; }
        .status-closed { color: #dc2626; }
        .attachment-box { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center; }
        .attachment-icon { font-size: 40px; margin-bottom: 12px; }
        .attachment-box p { margin: 8px 0; color: #10b981; font-weight: 600; }
        .attachment-box .subtitle { color: #d4d4d4; font-weight: normal; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #8359cf 0%, #6b47b8 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; margin: 24px 0; box-shadow: 0 4px 16px rgba(131, 89, 207, 0.4); }
        .footer { background: #0b0b0b; padding: 30px; text-align: center; border-top: 1px solid rgba(131, 89, 207, 0.2); }
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
            <h1>✅ Ticket Closed</h1>
        </div>
        <div class="content">
            <p style="font-size: 17px; color: #f0f0f0; margin-bottom: 24px; font-weight: 500;">Hello,</p>
            <p style="color: #d4d4d4; margin-bottom: 24px; font-size: 15px; line-height: 1.8;">Your support ticket has been successfully resolved and closed.</p>
            
            <div class="ticket-card">
                <h2>📋 Ticket Summary</h2>
                <div class="info-row">
                    <span class="info-label" style="color: #d4d4d4; font-size: 14px;">Ticket ID</span>
                    <span class="info-value" style="color: #ffffff; font-size: 15px; font-weight: 600;">#${ticketId}</span>
                </div>
                <div class="info-row">
                    <span class="info-label" style="color: #d4d4d4; font-size: 14px;">Subject</span>
                    <span class="info-value" style="color: #ffffff; font-size: 15px; font-weight: 600;">${ticket.subject}</span>
                </div>
                <div class="info-row">
                    <span class="info-label" style="color: #d4d4d4; font-size: 14px;">Status</span>
                    <span class="info-value" style="color: #dc2626; font-size: 15px; font-weight: 600;">Closed</span>
                </div>
                <div class="info-row">
                    <span class="info-label" style="color: #d4d4d4; font-size: 14px;">Closed Date</span>
                    <span class="info-value" style="color: #ffffff; font-size: 15px; font-weight: 600;">${new Date(timestamp * 1000).toLocaleString()}</span>
                </div>
            </div>
            
            <div class="attachment-box">
                <div class="attachment-icon">📎</div>
                <p style="color: #10b981; font-weight: 600; font-size: 15px;">Full Conversation Transcript Attached</p>
                <p style="color: #d4d4d4; font-size: 13px; font-weight: normal;">Open the attached HTML file to view the complete conversation history</p>
            </div>
            
            <div class="divider"></div>
            
            <p style="color: #d4d4d4; text-align: center; margin: 24px 0; font-size: 15px;">Need more help? Create a new ticket anytime:</p>
            <center>
                <a href="https://shop.accvaults.com/tickets" class="cta-button">Create New Ticket</a>
            </center>
        </div>
        <div class="footer">
            <div class="signature">
                <div class="signature-name">AccVaults Support Team</div>
                <div class="signature-title">Customer Support</div>
                <div class="signature-company">AccVaults - Premium Digital Services</div>
            </div>
            <p style="color: #d4d4d4; font-size: 13px; margin: 16px 0;">We're here to help 24/7</p>
            <p><a href="https://shop.accvaults.com">shop.accvaults.com</a></p>
        </div>
    </div>
</body>
</html>`;

            console.log('📧 Sending closure email to customer:', ticket.customer_email);
            
            const emailResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'AccVaults Support <support@tickets.accvaults.com>',
                    to: ticket.customer_email,
                    subject: `Your Ticket Has Been Closed - #${ticketId}`,
                    html: customerEmailHTML,
                    attachments: [{
                        filename: `ticket-${ticketId}-transcript.html`,
                        content: Buffer.from(htmlTranscript).toString('base64')
                    }]
                })
            });
            
            const emailResult = await emailResponse.json();
            console.log('📧 Customer email result:', emailResult);
            
            if (!emailResponse.ok) {
                console.error('❌ Failed to send customer email:', emailResult);
            } else {
                console.log('✅ Customer closure email sent successfully');
            }
        } catch (emailError) {
            console.error('❌ Failed to send customer closure email:', emailError);
        }
        
        console.log('✅ Ticket closed:', ticketId);
        
        return new Response(JSON.stringify({
            success: true,
            message: 'Ticket closed successfully',
            data: {
                ticket_id: ticketId,
                status: 'closed',
                updated_at: timestamp
            }
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
        
    } catch (error) {
        console.error('Error closing ticket:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to close ticket',
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
