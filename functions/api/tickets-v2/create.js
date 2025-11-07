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
