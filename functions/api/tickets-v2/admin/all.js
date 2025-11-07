// Admin - Get All Tickets

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
    const { env } = context;
    
    try {
        // Get all tickets ordered by most recent first
        const { results: tickets } = await env.DB.prepare(
            'SELECT * FROM tickets ORDER BY created_at DESC'
        ).all();
        
        // Get message count for each ticket
        const ticketsWithCounts = await Promise.all(tickets.map(async (ticket) => {
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
        console.error('Error fetching all tickets:', error);
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
