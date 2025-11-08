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
                            html: `
                                <h2>You have a new reply to your support ticket</h2>
                                <p><strong>Ticket ID:</strong> ${ticketId}</p>
                                <p><strong>Subject:</strong> ${ticketSubject}</p>
                                <p><strong>Reply from Support:</strong></p>
                                <p>${message}</p>
                                <br>
                                <p>You can view and reply to your ticket at:</p>
                                <p><a href="https://shop.accvaults.com/tickets.html">https://shop.accvaults.com/tickets.html</a></p>
                                <br>
                                <p>Thank you,<br>AccVaults Support Team</p>
                            `
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
