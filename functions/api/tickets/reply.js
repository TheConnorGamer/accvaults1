// Cloudflare Pages Function to reply to Paylix ticket

// Handle CORS preflight
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
    const { request } = context;
    
    try {
        const body = await request.json();
        const { ticketId, reply } = body;
        
        if (!ticketId || !reply) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        
        // Get API key from environment
        const apiKey = context.env.PAYLIX_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'API key not configured' }), {
                status: 500,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        
        // Call Paylix API
        const paylixResponse = await fetch(`https://api.paylix.gg/v1/queries/reply/${ticketId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
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
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        
        const data = await paylixResponse.json();
        
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        console.error('Error replying to ticket:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}
