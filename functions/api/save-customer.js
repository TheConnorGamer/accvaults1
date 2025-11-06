// Save customer registration data locally
// This creates/updates a customers.json file to track all registrations

export async function onRequest(context) {
    const { request, env } = context;

    // Handle CORS
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            },
        });
    }

    try {
        const { action, customerData } = await request.json();

        if (action === 'save') {
            // In Cloudflare Pages, we can't write to filesystem
            // Instead, we'll use KV storage or Durable Objects
            // For now, we'll return success and log the data
            
            console.log('Customer registered:', {
                email: customerData.email,
                username: customerData.username,
                customerId: customerData.customerId,
                registeredAt: customerData.registeredAt
            });

            // TODO: Integrate with Cloudflare KV or D1 database for persistent storage
            // For now, all customer data is in Paylix Customers API
            
            return new Response(JSON.stringify({
                success: true,
                message: 'Customer data logged',
                note: 'Customer data is stored in Paylix Customers API'
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        if (action === 'list') {
            // Return message that data is in Paylix
            return new Response(JSON.stringify({
                success: true,
                message: 'Customer data is stored in Paylix Customers API',
                note: 'Use /api/auth with action: listCustomers to get all customers'
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        return new Response(JSON.stringify({
            success: false,
            error: 'Invalid action'
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });

    } catch (error) {
        console.error('Save customer error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to save customer data'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}
