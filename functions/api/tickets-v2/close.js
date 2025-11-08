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
            const customerEmailBody = `Hello,

Your support ticket has been closed.

Ticket Details:
- Ticket ID: #${ticketId}
- Subject: ${ticket.subject}
- Status: Closed
- Closed Date: ${new Date(timestamp * 1000).toLocaleString()}

Below is the complete transcript of your conversation:

${transcript}

If you need further assistance, please create a new ticket at https://shop.accvaults.com/tickets.html

Thank you for contacting AccVaults Support!

Best regards,
AccVaults Support Team`;

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
                    text: customerEmailBody
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
