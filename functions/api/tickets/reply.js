// Cloudflare Pages Function to reply to Paylix ticket
export async function onRequestPost(context) {
    const { request } = context;
    
    try {
        const body = await request.json();
        const { ticketId, reply } = body;
        
        if (!ticketId || !reply) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Call Paylix API
        const paylixResponse = await fetch(`https://paylixecommerce.com/api/queries/reply/${ticketId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer EzxWYoBzSAECBsJojXHrAOJQbBD4SEHdPJNS7b6mu418C96uVb2RQiP8ALzj5CzA`
            },
            body: JSON.stringify({
                reply: reply
            })
        });
        
        if (!paylixResponse.ok) {
            const errorText = await paylixResponse.text();
            console.error('Paylix API error:', errorText);
            return new Response(JSON.stringify({ error: 'Failed to reply to ticket' }), {
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
        console.error('Error replying to ticket:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
