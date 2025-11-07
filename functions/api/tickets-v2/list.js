// Custom Ticket System - List Tickets

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}

export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        const url = new URL(request.url);
        const email = url.searchParams.get('email');
        
        if (!email) {
            return new Response(JSON.stringify({ 
                error: 'Email parameter required'
            }), {
                status: 400,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        
        // Get all tickets for this email
        const { results } = await env.DB.prepare(
            'SELECT * FROM tickets WHERE customer_email = ? ORDER BY created_at DESC'
        ).bind(email).all();
        
        // Get message count for each ticket
        const ticketsWithCounts = await Promise.all(results.map(async (ticket) => {
            const { results: messages } = await env.DB.prepare(
                'SELECT COUNT(*) as count FROM ticket_messages WHERE ticket_id = ?'
            ).bind(ticket.ticket_id).all();
            
            return {
                ...ticket,
                message_count: messages[0]?.count || 0
            };
        }));
        
        return new Response(JSON.stringify({
            success: true,
            data: ticketsWithCounts,
            count: ticketsWithCounts.length
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
        
    } catch (error) {
        console.error('Error fetching tickets:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to fetch tickets',
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
