// Cloudflare Pages Function for Paylix stats

// Helper function to convert timestamp to relative time
function getTimeAgo(timestamp) {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`;
    return `${Math.floor(diff / 2592000)} months ago`;
}

export async function onRequest(context) {
    const { request, env } = context;
    const PAYLIX_API_KEY = env.PAYLIX_API_KEY;
    const MERCHANT_NAME = 'accvaults';

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
            },
        });
    }

    // Check if API key is available
    if (!PAYLIX_API_KEY) {
        console.error('PAYLIX_API_KEY environment variable is not set');
        return new Response(JSON.stringify({
            error: 'API key not configured',
            stats: {
                feedbackRating: 0,
                productsSold: 0,
                totalCustomers: 0,
                totalReviews: 0
            },
            reviews: []
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }

    try {
        // Fetch orders from Paylix API
        const ordersResponse = await fetch(`https://dev.paylix.gg/v1/orders`, {
            headers: {
                'Authorization': `Bearer ${PAYLIX_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // Fetch feedbacks from Paylix API
        const feedbackResponse = await fetch(`https://dev.paylix.gg/v1/feedback`, {
            headers: {
                'Authorization': `Bearer ${PAYLIX_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        let totalOrders = 0;
        let totalCustomers = 0;
        let uniqueCustomers = new Set();

        // Process orders
        if (ordersResponse.ok) {
            // Get raw text and clean BOM character
            const ordersText = await ordersResponse.text();
            const cleanOrdersText = ordersText.trim().replace(/^\uFEFF/, '');
            const ordersData = JSON.parse(cleanOrdersText);
            console.log('Paylix orders response:', JSON.stringify(ordersData, null, 2));
            
            // Handle different response formats
            const orders = ordersData.data?.orders || ordersData.data || [];
            
            // Only count COMPLETED orders for productsSold
            const completedOrders = Array.isArray(orders) 
                ? orders.filter(order => order.status === 'COMPLETED')
                : [];
            totalOrders = completedOrders.length;
            
            // Count unique customers from COMPLETED orders only
            if (Array.isArray(completedOrders)) {
                completedOrders.forEach(order => {
                    if (order.customer_email) {
                        uniqueCustomers.add(order.customer_email);
                    }
                });
            }
            totalCustomers = uniqueCustomers.size;
            
            console.log('Processed orders:', { 
                totalOrders: orders.length, 
                completedOrders: totalOrders, 
                totalCustomers 
            });
        } else {
            console.error('Orders API failed:', ordersResponse.status, await ordersResponse.text());
        }

        let feedbacks = [];
        let averageRating = 0;
        
        // Process feedbacks
        if (feedbackResponse.ok) {
            // Get raw text and clean BOM character
            const feedbackText = await feedbackResponse.text();
            const cleanFeedbackText = feedbackText.trim().replace(/^\uFEFF/, '');
            const feedbackData = JSON.parse(cleanFeedbackText);
            console.log('Paylix feedback response:', JSON.stringify(feedbackData, null, 2));
            
            // Handle different response formats
            feedbacks = feedbackData.data?.feedback || feedbackData.data || [];
            
            // Calculate average rating from feedbacks
            if (Array.isArray(feedbacks) && feedbacks.length > 0) {
                const totalRating = feedbacks.reduce((sum, f) => sum + (f.score || 5), 0);
                averageRating = totalRating / feedbacks.length;
            }
            
            console.log('Processed feedbacks:', { count: feedbacks.length, averageRating });
        } else {
            console.error('Feedback API failed:', feedbackResponse.status, await feedbackResponse.text());
        }

        return new Response(JSON.stringify({
            stats: {
                feedbackRating: averageRating,
                productsSold: totalOrders,
                totalCustomers: totalCustomers,
                totalReviews: feedbacks.length
            },
            reviews: feedbacks.slice(0, 6).map(feedback => {
                const customerName = 'Customer';
                const timeAgo = feedback.created_at ? getTimeAgo(feedback.created_at) : 'Recently';
                
                return {
                    id: feedback.id,
                    name: customerName,
                    rating: feedback.score || 5,
                    text: feedback.message || '',
                    date: timeAgo,
                    avatar: customerName.substring(0, 2).toUpperCase()
                };
            })
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });

    } catch (error) {
        console.error('Error fetching Paylix data:', error);
        
        // Return empty data if API fails
        return new Response(JSON.stringify({
            stats: {
                feedbackRating: 0,
                productsSold: 0,
                totalCustomers: 0,
                totalReviews: 0
            },
            reviews: []
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}
