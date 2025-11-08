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
        
        // Generate transcript (plain text for admin)
        let transcript = `Ticket #${ticketId} - ${ticket.subject}\n`;
        transcript += `Customer: ${ticket.customer_email}\n`;
        transcript += `Created: ${new Date(ticket.created_at * 1000).toLocaleString()}\n`;
        transcript += `Closed: ${new Date(timestamp * 1000).toLocaleString()}\n\n`;
        transcript += `=== CONVERSATION ===\n\n`;
        
        // Add initial message
        transcript += `[${new Date(ticket.created_at * 1000).toLocaleString()}] Customer:\n${ticket.message}\n\n`;
        
        // Add all replies
        for (const msg of messages) {
            const senderType = msg.sender_type === 'support' ? 'Support Team' : 'Customer';
            transcript += `[${new Date(msg.created_at * 1000).toLocaleString()}] ${senderType}:\n${msg.message}\n\n`;
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
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background: #f5f5f5; margin: 0; padding: 40px 20px; }
        .transcript-container { max-width: 800px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1); border: 1px solid #e5e5e5; }
        .header { background: linear-gradient(135deg, #8359cf 0%, #6b47b8 100%); padding: 40px; text-align: center; }
        .header img { width: 80px; height: 80px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; }
        .header p { margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px; }
        .ticket-info { background: #f8f9fa; border: 1px solid #e5e5e5; border-radius: 12px; padding: 30px; margin-bottom: 30px; }
        .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .info-label { color: #8359cf; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
        .info-value { color: #1a1a1a; font-size: 16px; font-weight: 600; }
        .info-value a { color: #1a1a1a !important; text-decoration: none !important; pointer-events: none; }
        .status-closed { color: #dc2626; }
        .conversation { margin-top: 40px; }
        .conversation h2 { color: #8359cf; font-size: 24px; margin-bottom: 24px; }
        .message { background: #f8f9fa; border-radius: 12px; padding: 24px; margin-bottom: 20px; border-left: 4px solid #8359cf; }
        .message.support { border-left-color: #10b981; background: #f0fdf4; }
        .message-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e5e5e5; }
        .message-sender { font-weight: 700; color: #8359cf; font-size: 14px; }
        .message.support .message-sender { color: #10b981; }
        .message-time { color: #666; font-size: 13px; }
        .message-content { color: #1a1a1a; line-height: 1.8; font-size: 15px; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e5e5e5; }
        .footer p { margin: 8px 0; color: #666; font-size: 14px; }
        @media (max-width: 600px) {
            body { padding: 20px 10px; }
            .header { padding: 30px 20px; }
            .content { padding: 30px 20px; }
            .ticket-info { padding: 20px; }
            .info-grid { grid-template-columns: 1fr; gap: 16px; }
            .message { padding: 16px; }
        }
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
                        <div class="info-value" style="word-break: break-all; user-select: all; font-family: monospace;">${ticket.customer_email.split('').join('&#8203;')}</div>
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
                
                ${messages.map(msg => `
                    <div class="message ${msg.sender_type === 'support' ? 'support' : ''}">
                        <div class="message-header">
                            <span class="message-sender">${msg.sender_type === 'support' ? '🛡️ Support Team' : '👤 Customer'}</span>
                            <span class="message-time">${new Date(msg.created_at * 1000).toLocaleString()}</span>
                        </div>
                        <div class="message-content">${msg.message || 'No message content'}</div>
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
            
            // Store transcript in database
            try {
                await env.DB.prepare(
                    'INSERT OR REPLACE INTO ticket_transcripts (ticket_id, transcript_html, created_at) VALUES (?, ?, ?)'
                ).bind(ticketId, htmlTranscript, timestamp).run();
                console.log('✅ Transcript stored in database');
            } catch (dbError) {
                console.error('❌ Failed to store transcript:', dbError);
            }
            
            // Create download link
            const transcriptUrl = `https://shop.accvaults.com/api/transcripts/${ticketId}`;
            
            // Create HTML email matching create.js design
            const customerEmailHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.8; color: #1a1a1a; background: #f5f5f5; margin: 0; padding: 20px; }
        .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1); border: 1px solid #e5e5e5; }
        .header { background: linear-gradient(135deg, #8359cf 0%, #6b47b8 100%); padding: 40px 30px; text-align: center; }
        .header .icon { font-size: 48px; margin-bottom: 10px; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; color: #ffffff !important; }
        .content { padding: 40px 30px; background: #ffffff; }
        .ticket-card { background: #f8f9fa; border: 1px solid #e5e5e5; border-radius: 12px; padding: 24px; margin: 24px 0; }
        .ticket-card h2 { margin: 0 0 16px 0; font-size: 18px; color: #8359cf !important; font-weight: 600; }
        .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e5e5; }
        .info-row:last-child { border-bottom: none; }
        .download-box { background: #f0fdf4; border: 2px solid #10b981; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; }
        .download-button { display: inline-block; background: #10b981; color: #ffffff !important; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; margin: 16px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #8359cf 0%, #6b47b8 100%); color: #ffffff !important; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; margin: 24px 0; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e5e5e5; }
        .footer a { color: #8359cf !important; text-decoration: none; font-weight: 600; }
        .divider { height: 1px; background: #e5e5e5; margin: 30px 0; }
        @media (prefers-color-scheme: dark) {
            body { background: #0b0b0b !important; color: #ffffff !important; }
            .email-container { background: #1a1a1a !important; border-color: rgba(131, 89, 207, 0.3) !important; }
            .content { background: #1a1a1a !important; }
            .ticket-card { background: rgba(131, 89, 207, 0.1) !important; border-color: rgba(131, 89, 207, 0.3) !important; }
            .download-box { background: rgba(16, 185, 129, 0.1) !important; border-color: rgba(16, 185, 129, 0.3) !important; }
            .footer { background: #0f0f0f !important; border-color: rgba(131, 89, 207, 0.2) !important; }
            .info-row { border-color: rgba(255,255,255,0.1) !important; }
            .divider { background: rgba(131, 89, 207, 0.5) !important; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="icon">✅</div>
            <h1>Ticket Closed</h1>
        </div>
        <div class="content">
            <p style="font-size: 17px; margin-bottom: 24px; font-weight: 500;">Hello,</p>
            <p style="margin-bottom: 24px; font-size: 15px; line-height: 1.8;">Your support ticket has been successfully resolved and closed.</p>
            
            <div class="ticket-card">
                <h2>📋 Ticket Summary</h2>
                <div class="info-row">
                    <span style="font-size: 14px; color: #666;">Ticket ID</span>
                    <span style="font-size: 15px; font-weight: 600; color: #1a1a1a;">#${ticketId}</span>
                </div>
                <div class="info-row">
                    <span style="font-size: 14px; color: #666;">Subject</span>
                    <span style="font-size: 15px; font-weight: 600; color: #1a1a1a;">${ticket.subject}</span>
                </div>
                <div class="info-row">
                    <span style="font-size: 14px; color: #666;">Status</span>
                    <span style="font-size: 15px; font-weight: 600; color: #dc2626;">Closed</span>
                </div>
                <div class="info-row">
                    <span style="font-size: 14px; color: #666;">Closed Date</span>
                    <span style="font-size: 15px; font-weight: 600; color: #1a1a1a;">${new Date(timestamp * 1000).toLocaleString()}</span>
                </div>
            </div>
            
            <div class="download-box">
                <p style="font-size: 18px; font-weight: 600; color: #10b981; margin: 0 0 8px 0;">📎 Conversation Transcript</p>
                <p style="color: #666; font-size: 14px; margin: 0 0 16px 0;">Download the complete conversation history</p>
                <a href="${transcriptUrl}" class="download-button">Download Transcript</a>
            </div>
            
            <div class="divider"></div>
            
            <p style="text-align: center; margin: 24px 0; font-size: 15px;">Need more help? Create a new ticket anytime:</p>
            <center>
                <a href="https://shop.accvaults.com/tickets" class="cta-button">Create New Ticket</a>
            </center>
        </div>
        <div class="footer">
            <p><strong>AccVaults Support Team</strong></p>
            <p style="color: #666;">We're here to help 24/7</p>
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
                    text: `Hello,

Your support ticket has been successfully resolved and closed.

Ticket ID: #${ticketId}
Subject: ${ticket.subject}
Status: Closed
Closed Date: ${new Date(timestamp * 1000).toLocaleString()}

Download your conversation transcript: ${transcriptUrl}

Need more help? Create a new ticket anytime at: https://shop.accvaults.com/tickets

Thank you,
AccVaults Support Team
shop.accvaults.com`,
                    html: customerEmailHTML
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
