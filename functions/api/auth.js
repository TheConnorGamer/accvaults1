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

    // Check customer in Paylix using proper API endpoint
    try {
        // List customers and filter by email (Paylix API structure)
        const response = await fetch('https://dev.paylix.gg/v1/customers', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Paylix API error:', response.status);
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

        const text = await response.text();
        const cleanText = text.trim().replace(/^\uFEFF/, '');
        const data = JSON.parse(cleanText);
        
        // Get customers array from response
        const allCustomers = data.data?.customers || data.customers || [];
        
        // Find customer by email
        const customer = allCustomers.find(c => c.email?.toLowerCase() === email.toLowerCase());
        
        if (!customer) {
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
                username: customer.name || customer.metadata?.username || customer.email.split('@')[0],
                role: 'customer',
                isStaff: false,
                customerId: customer.uniqid || customer.id
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
        const checkResponse = await fetch('https://dev.paylix.gg/v1/customers', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (checkResponse.ok) {
            const text = await checkResponse.text();
            const cleanText = text.trim().replace(/^\uFEFF/, '');
            const data = JSON.parse(cleanText);
            const allCustomers = data.data?.customers || data.customers || [];
            
            const existingCustomer = allCustomers.find(c => c.email?.toLowerCase() === email.toLowerCase());
            
            if (existingCustomer) {
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

        // Parse name from username or email
        const nameParts = (username || email.split('@')[0]).split(/[\s._-]/);
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts[1] || 'Customer';

        // Create new customer in Paylix with REQUIRED fields
        const customerPayload = {
            email: email.trim(),
            name: firstName.trim(),
            surname: lastName.trim(),
            metadata: {
                username: (username || email.split('@')[0]).trim(),
                password_hash: hashPassword(password),
                registered_at: new Date().toISOString(),
                registration_source: 'website'
            }
        };

        console.log('Creating customer with payload:', {
            email: customerPayload.email,
            name: customerPayload.name,
            surname: customerPayload.surname
        });

        const createResponse = await fetch('https://dev.paylix.gg/v1/customers', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerPayload)
        });

        if (!createResponse.ok) {
            const errorText = await createResponse.text();
            console.error('Paylix create customer error:', {
                status: createResponse.status,
                statusText: createResponse.statusText,
                body: errorText
            });
            
            // Try to parse error message
            let errorMessage = 'Registration failed. Please try again.';
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                // Use default message
            }
            
            return new Response(JSON.stringify({
                success: false,
                error: errorMessage,
                details: createResponse.status === 400 ? 'Invalid data provided' : 'Server error'
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        const responseText = await createResponse.text();
        const cleanResponseText = responseText.trim().replace(/^\uFEFF/, '');
        const customerData = JSON.parse(cleanResponseText);
        const customer = customerData.data?.customer || customerData.customer;

        return new Response(JSON.stringify({
            success: true,
            user: {
                email: customer.email,
                username: customer.metadata?.username || username,
                role: 'customer',
                isStaff: false,
                customerId: customer.uniqid || customer.id
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
