// Cloudflare Pages Function to create Paylix checkout

export async function onRequest(context) {
    const { request, env } = context;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }

    try {
        const { cart, email, couponCode } = await request.json();

        // Validate input
        if (!cart || cart.length === 0) {
            return new Response(JSON.stringify({ error: 'Cart is empty' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        if (!email) {
            return new Response(JSON.stringify({ error: 'Email is required' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        // Build Paylix cart payload
        const cartProducts = cart.map(item => ({
            uniqid: item.paylixGroupId,
            unit_quantity: 1
        }));

        const payload = {
            cart: {
                products: cartProducts
            },
            email: email,
            white_label: false,
            return_url: new URL(request.url).origin + '/'
        };

        // Add coupon if provided
        if (couponCode) {
            payload.coupon_code = couponCode;
        }

        // Call Paylix API
        const response = await fetch('https://dev.paylix.gg/v1/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${env.PAYLIX_API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Paylix API Error:', data);
            return new Response(JSON.stringify({ 
                error: 'Failed to create checkout',
                details: data 
            }), {
                status: response.status,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        // Return the checkout URL
        return new Response(JSON.stringify({
            success: true,
            checkoutUrl: data.data.url,
            paymentId: data.data.uniqid
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });

    } catch (error) {
        console.error('Function error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error',
            message: error.message 
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}
