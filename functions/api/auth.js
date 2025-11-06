// Authentication API for AccVaults
// Handles login, register, and session management

const ADMIN_CREDENTIALS = {
    email: 'connazlunn@gmail.com',
    password: 'Admin123!',
    role: 'admin',
    username: 'Admin'
};

// Simple password hashing (in production, use bcrypt)
function hashPassword(password) {
    // For now, we'll use a simple hash
    // In production, use proper bcrypt or similar
    return btoa(password); // Base64 encoding (NOT secure for production)
}

function verifyPassword(password, hash) {
    return hashPassword(password) === hash;
}

export async function onRequest(context) {
    const { request, env } = context;
    const PAYLIX_API_KEY = env.PAYLIX_API_KEY;

    // Handle CORS
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
            },
        });
    }

    if (!PAYLIX_API_KEY) {
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
        const { action, email, password, username } = await request.json();

        switch (action) {
            case 'login':
                return await handleLogin(email, password, PAYLIX_API_KEY);
            
            case 'register':
                return await handleRegister(email, password, username, PAYLIX_API_KEY);
            
            case 'verify':
                return await verifySession(email, PAYLIX_API_KEY);
            
            default:
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
        }
    } catch (error) {
        console.error('Auth error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Authentication failed'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}

async function handleLogin(email, password, apiKey) {
    // Check if admin login
    if (email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase() && 
        password === ADMIN_CREDENTIALS.password) {
        return new Response(JSON.stringify({
            success: true,
            user: {
                email: ADMIN_CREDENTIALS.email,
                username: ADMIN_CREDENTIALS.username,
                role: 'admin',
                isStaff: true
            }
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }

    // Check customer in Paylix
    try {
        // Get customer by email from Paylix
        const response = await fetch(`https://dev.paylix.gg/v1/customers?email=${encodeURIComponent(email)}`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Invalid email or password'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        const data = await response.json();
        const customers = data.data?.customers || [];
        
        if (customers.length === 0) {
            return new Response(JSON.stringify({
                success: false,
                error: 'No account found. Please register first.'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        const customer = customers[0];
        
        // Verify password (stored in customer metadata)
        if (customer.metadata && customer.metadata.password_hash) {
            if (!verifyPassword(password, customer.metadata.password_hash)) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Invalid email or password'
                }), {
                    status: 401,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            }
        }

        return new Response(JSON.stringify({
            success: true,
            user: {
                email: customer.email,
                username: customer.metadata?.username || customer.email.split('@')[0],
                role: 'customer',
                isStaff: false,
                customerId: customer.id
            }
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });

    } catch (error) {
        console.error('Login error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Login failed. Please try again.'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}

async function handleRegister(email, password, username, apiKey) {
    try {
        // Check if customer already exists
        const checkResponse = await fetch(`https://dev.paylix.gg/v1/customers?email=${encodeURIComponent(email)}`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (checkResponse.ok) {
            const data = await checkResponse.json();
            const customers = data.data?.customers || [];
            
            if (customers.length > 0) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'An account with this email already exists'
                }), {
                    status: 409,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            }
        }

        // Create new customer in Paylix
        const createResponse = await fetch('https://dev.paylix.gg/v1/customers', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                metadata: {
                    username: username || email.split('@')[0],
                    password_hash: hashPassword(password),
                    registered_at: new Date().toISOString()
                }
            })
        });

        if (!createResponse.ok) {
            const errorData = await createResponse.json();
            return new Response(JSON.stringify({
                success: false,
                error: errorData.message || 'Registration failed'
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        const customerData = await createResponse.json();
        const customer = customerData.data?.customer;

        return new Response(JSON.stringify({
            success: true,
            user: {
                email: customer.email,
                username: customer.metadata?.username || username,
                role: 'customer',
                isStaff: false,
                customerId: customer.id
            }
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });

    } catch (error) {
        console.error('Registration error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Registration failed. Please try again.'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}

async function verifySession(email, apiKey) {
    // Verify if session is still valid
    if (email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase()) {
        return new Response(JSON.stringify({
            success: true,
            valid: true,
            user: {
                email: ADMIN_CREDENTIALS.email,
                role: 'admin',
                isStaff: true
            }
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }

    try {
        const response = await fetch(`https://dev.paylix.gg/v1/customers?email=${encodeURIComponent(email)}`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return new Response(JSON.stringify({
                success: true,
                valid: false
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        return new Response(JSON.stringify({
            success: true,
            valid: true
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });

    } catch (error) {
        return new Response(JSON.stringify({
            success: true,
            valid: false
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}
