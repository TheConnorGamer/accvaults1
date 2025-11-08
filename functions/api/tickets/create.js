// Cloudflare Pages Function to create Paylix tickets

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
    const { request, env } = context;
    
    try {
        console.log('Received ticket creation request');
        const body = await request.json();
        const { email, title, message } = body;
        
        console.log('Request data:', { email, title, message: message?.substring(0, 50) });
        
        // Validate input
        if (!email || !title || !message) {
            console.error('Missing required fields');
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        
        // Get API key from environment
        const apiKey = env.PAYLIX_API_KEY;
        console.log('API key present:', !!apiKey);
        
        if (!apiKey) {
            console.error('API key not configured');
            return new Response(JSON.stringify({ error: 'API key not configured' }), {
                status: 500,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        
        // Call Paylix API
        console.log('Calling Paylix API...');
        const paylixResponse = await fetch('https://dev.paylix.gg/v1/queries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                customer_email: email,
                title: title,
                message: message
            })
        });
        
        console.log('Paylix response status:', paylixResponse.status);
        
        const responseText = await paylixResponse.text();
        console.log('Paylix raw response:', responseText);
        console.log('Response headers:', Object.fromEntries(paylixResponse.headers.entries()));
        
        if (!paylixResponse.ok) {
            console.error('Paylix API error:', responseText);
            return new Response(JSON.stringify({ 
                error: 'Failed to create ticket',
                details: responseText.substring(0, 200),
                status: paylixResponse.status
            }), {
                status: paylixResponse.status,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        
        // Handle empty response
        if (!responseText || responseText.trim() === '') {
            console.log('Empty response from Paylix, assuming success');
            return new Response(JSON.stringify({ 
                status: 'ok',
                message: 'Ticket created successfully'
            }), {
                status: 200,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse Paylix response:', e);
            console.error('Response text:', responseText);
            // If we can't parse but got 200, treat as success
            return new Response(JSON.stringify({ 
                status: 'ok',
                message: 'Ticket created successfully',
                raw_response: responseText.substring(0, 100)
            }), {
                status: 200,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        
        console.log('Paylix response data:', data);
        
        // Ensure we return a proper response
        return new Response(JSON.stringify(data || { status: 'ok', message: 'Ticket created' }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        console.error('Error creating ticket:', error);
        return new Response(JSON.stringify({ 
            error: error.message || 'Internal server error',
            stack: error.stack?.substring(0, 200)
        }), {
            status: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}
