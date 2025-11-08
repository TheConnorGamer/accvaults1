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
            // Create HTML email
            const customerEmailHTML = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #8359cf 0%, #6b47b8 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .ticket-info { background: #f8f9fa; border-left: 4px solid #8359cf; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .ticket-info p { margin: 8px 0; }
        .ticket-info strong { color: #8359cf; }
        .message { background: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 8px; border: 1px solid #e0e0e0; }
        .message-header { font-size: 12px; color: #666; margin-bottom: 8px; }
        .message-sender { font-weight: bold; color: #8359cf; }
        .message-time { color: #999; }
        .message-content { color: #333; }
        .customer-message { background: linear-gradient(135deg, #8359cf 0%, #6b47b8 100%); color: white; }
        .customer-message .message-sender { color: white; }
        .customer-message .message-time { color: rgba(255,255,255,0.8); }
        .customer-message .message-content { color: white; }
        .button { display: inline-block; background: #8359cf; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .button:hover { background: #6b47b8; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .footer a { color: #8359cf; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎫 Ticket Closed</h1>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>Your support ticket has been resolved and closed.</p>
            
            <div class="ticket-info">
                <p><strong>Ticket ID:</strong> #${ticketId}</p>
                <p><strong>Subject:</strong> ${ticket.subject}</p>
                <p><strong>Status:</strong> <span style="color: #dc2626;">Closed</span></p>
                <p><strong>Closed Date:</strong> ${new Date(timestamp * 1000).toLocaleString()}</p>
            </div>
            
            <h3 style="color: #8359cf;">📝 Conversation History</h3>
            
            <div class="message customer-message">
                <div class="message-header">
                    <span class="message-sender">👤 You</span>
                    <span class="message-time"> • ${new Date(ticket.created_at * 1000).toLocaleString()}</span>
                </div>
                <div class="message-content">${ticket.message}</div>
            </div>
            
            ${messages.map(msg => `
                <div class="message ${msg.sender_type === 'customer' ? 'customer-message' : ''}">
                    <div class="message-header">
                        <span class="message-sender">${msg.sender_type === 'support' ? '🛡️ Support Team' : '👤 You'}</span>
                        <span class="message-time"> • ${new Date(msg.created_at * 1000).toLocaleString()}</span>
                    </div>
                    <div class="message-content">${msg.message}</div>
                </div>
            `).join('')}
            
            <p style="margin-top: 30px;">If you need further assistance, please don't hesitate to create a new ticket.</p>
            
            <center>
                <a href="https://shop.accvaults.com/tickets.html" class="button">Create New Ticket</a>
            </center>
        </div>
        <div class="footer">
            <p>Thank you for contacting AccVaults Support!</p>
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
                    text: transcript,
                    attachments: [{
                        filename: `ticket-${ticketId}-transcript.txt`,
                        content: Buffer.from(transcript).toString('base64')
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
