// Cloudflare Pages Function to create Paylix tickets
export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const body = await request.json();
        const { email, title, message } = body;
        
        // Validate input
        if (!email || !title || !message) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Call Paylix API
        const paylixResponse = await fetch('https://paylixecommerce.com/api/queries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer EzxWYoBzSAECBsJojXHrAOJQbBD4SEHdPJNS7b6mu418C96uVb2RQiP8ALzj5CzA`
            },
            body: JSON.stringify({
                customer_email: email,
                title: title,
                message: message
            })
        });
        
        if (!paylixResponse.ok) {
            const errorText = await paylixResponse.text();
            console.error('Paylix API error:', errorText);
            return new Response(JSON.stringify({ error: 'Failed to create ticket' }), {
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
        console.error('Error creating ticket:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
