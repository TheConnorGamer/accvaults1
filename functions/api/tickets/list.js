// Cloudflare Pages Function to list Paylix tickets
export async function onRequestGet(context) {
    const { request } = context;
    
    try {
        const url = new URL(request.url);
        const email = url.searchParams.get('email');
        
        if (!email) {
            return new Response(JSON.stringify({ error: 'Email parameter required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Call Paylix API
        const paylixResponse = await fetch(`https://paylixecommerce.com/api/queries?customer_email=${encodeURIComponent(email)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer EzxWYoBzSAECBsJojXHrAOJQbBD4SEHdPJNS7b6mu418C96uVb2RQiP8ALzj5CzA`
            }
        });
        
        if (!paylixResponse.ok) {
            const errorText = await paylixResponse.text();
            console.error('Paylix API error:', errorText);
            return new Response(JSON.stringify({ error: 'Failed to fetch tickets' }), {
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
        console.error('Error fetching tickets:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
