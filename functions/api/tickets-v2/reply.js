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
