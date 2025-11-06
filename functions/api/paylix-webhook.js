// Paylix Webhook Handler for Cloudflare Pages

export async function onRequest(context) {
    const { request } = context;

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
        const webhookData = await request.json();
        
        console.log('📦 Paylix Webhook Received:', webhookData);

        // Handle different webhook events
        switch (webhookData.event) {
            case 'order.completed':
                // Order was completed
                console.log('✅ Order completed:', webhookData.data.order_id);
                // You can:
                // - Send Discord notification
                // - Update database
                // - Send email
                // - Deliver digital products
                break;

            case 'order.refunded':
                // Order was refunded
                console.log('💰 Order refunded:', webhookData.data.order_id);
                break;

            case 'subscription.created':
                // New subscription
                console.log('🔄 Subscription created:', webhookData.data.subscription_id);
                break;

            case 'subscription.cancelled':
                // Subscription cancelled
                console.log('❌ Subscription cancelled:', webhookData.data.subscription_id);
                break;

            default:
                console.log('ℹ️ Unknown event:', webhookData.event);
        }

        // Always return 200 to acknowledge receipt
        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });

    } catch (error) {
        console.error('Webhook error:', error);
        return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}
