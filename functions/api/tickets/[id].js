// Cloudflare Pages Function to get ticket details
export async function onRequestGet(context) {
    const { params } = context;
    const ticketId = params.id;
    
    try {
        if (!ticketId) {
            return new Response(JSON.stringify({ error: 'Ticket ID required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Call Paylix API
        const paylixResponse = await fetch(`https://api.paylix.gg/queries/${ticketId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer EzxWYoBzSAECBsJojXHrAOJQbBD4SEHdPJNS7b6mu418C96uVb2RQiP8ALzj5CzA`
            }
        });
        
        if (!paylixResponse.ok) {
            const errorText = await paylixResponse.text();
            console.error('Paylix API error:', errorText);
            return new Response(JSON.stringify({ error: 'Failed to fetch ticket' }), {
                status: paylixResponse.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const data = await paylixResponse.json();
        
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching ticket:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
