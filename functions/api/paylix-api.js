// Centralized Paylix API Service for Cloudflare Pages

const PAYLIX_BASE_URL = 'https://dev.paylix.gg/v1';
const MERCHANT_NAME = 'accvaults';

// Helper function to make Paylix API calls
async function callPaylixAPI(endpoint, method = 'GET', body = null, apiKey) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${PAYLIX_BASE_URL}${endpoint}`, options);
    
    // Get raw text first to handle any parsing issues
    const text = await response.text();
    
    // Clean the text - remove any BOM or extra characters
    const cleanText = text.trim().replace(/^\uFEFF/, '');
    
    // Try to parse JSON
    let data;
    try {
        data = JSON.parse(cleanText);
    } catch (e) {
        console.error('Failed to parse JSON. Length:', text.length);
        console.error('First 200 chars:', text.substring(0, 200));
        console.error('Last 200 chars:', text.substring(text.length - 200));
        throw new Error('Invalid JSON response from Paylix API');
    }

    if (!response.ok) {
        throw new Error(data.message || 'Paylix API error');
    }

    return data;
}

export async function onRequest(context) {
    const { request, env } = context;
    const PAYLIX_API_KEY = env.PAYLIX_API_KEY;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            },
        });
    }

    // Check if API key is available
    if (!PAYLIX_API_KEY) {
        console.error('PAYLIX_API_KEY environment variable is not set');
        return new Response(JSON.stringify({
            success: false,
            error: 'API key not configured'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }

    try {
        const { action, ...params } = await request.json();

        console.log('Paylix API initialized with key:', PAYLIX_API_KEY ? 'Present' : 'MISSING');

        let result;

        switch (action) {
            // Get all products
            case 'getProducts':
                result = await callPaylixAPI('/products', 'GET', null, PAYLIX_API_KEY);
                break;

            // Get product by ID
            case 'getProduct':
                result = await callPaylixAPI(`/products/${params.productId}`, 'GET', null, PAYLIX_API_KEY);
                break;

            // Get all orders
            case 'getOrders':
                result = await callPaylixAPI('/orders', 'GET', null, PAYLIX_API_KEY);
                break;

            // Get order by ID
            case 'getOrder':
                result = await callPaylixAPI(`/orders/${params.orderId}`, 'GET', null, PAYLIX_API_KEY);
                break;

            // Get customer orders by email
            case 'getCustomerOrders':
                result = await callPaylixAPI(`/orders?email=${params.email}`, 'GET', null, PAYLIX_API_KEY);
                break;

            // Get all reviews/feedback
            case 'getReviews':
                result = await callPaylixAPI('/feedback', 'GET', null, PAYLIX_API_KEY);
                break;

            // Validate coupon
            case 'validateCoupon':
                result = await callPaylixAPI(`/coupons/${params.code}`, 'GET', null, PAYLIX_API_KEY);
                break;

            // Get analytics/stats
            case 'getStats':
                const orders = await callPaylixAPI('/orders', 'GET', null, PAYLIX_API_KEY);
                const products = await callPaylixAPI('/products', 'GET', null, PAYLIX_API_KEY);
                result = {
                    totalOrders: orders.data?.length || 0,
                    totalProducts: products.data?.length || 0,
                    totalRevenue: orders.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0
                };
                break;

            // Create payment
            case 'createPayment':
                result = await callPaylixAPI('/payments', 'POST', {
                    cart: params.cart,
                    email: params.email,
                    coupon_code: params.couponCode,
                    white_label: false,
                    return_url: params.returnUrl
                }, PAYLIX_API_KEY);
                break;

            // Check blacklist
            case 'checkBlacklist':
                result = await callPaylixAPI(`/blacklists?email=${params.email}`, 'GET', null, PAYLIX_API_KEY);
                break;

            // Get all categories
            case 'getCategories':
                result = await callPaylixAPI('/categories', 'GET', null, PAYLIX_API_KEY);
                break;

            // Get category by ID
            case 'getCategory':
                result = await callPaylixAPI(`/categories/${params.categoryId}`, 'GET', null, PAYLIX_API_KEY);
                break;

            default:
                return new Response(JSON.stringify({ error: 'Invalid action' }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
        }

        return new Response(JSON.stringify({ success: true, data: result }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });

    } catch (error) {
        console.error('Paylix API Error:', error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: error.message 
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}
