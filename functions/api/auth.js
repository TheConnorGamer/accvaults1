// Authentication API for AccVaults
// Handles login, register, and session management using D1 Database

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
    const db = env.DB;

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

    if (!db) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Database not configured'
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
                return await handleLogin(email, password, db);
            
            case 'register':
                return await handleRegister(email, password, username, db);
            
            case 'verify':
                return await verifySession(email, db);
            
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

async function handleLogin(email, password, db) {
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

    // Check customer in D1 database
    try {
        const result = await db.prepare(
            'SELECT * FROM users WHERE email = ?'
        ).bind(email.toLowerCase()).first();
        
        if (!result) {
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

        // Verify password
        if (!verifyPassword(password, result.password_hash)) {
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

        return new Response(JSON.stringify({
            success: true,
            user: {
                email: result.email,
                username: result.username,
                role: result.role,
                isStaff: result.role === 'admin',
                userId: result.id
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

async function handleRegister(email, password, username, db) {
    try {
        // Check if user already exists
        const existing = await db.prepare(
            'SELECT id FROM users WHERE email = ?'
        ).bind(email.toLowerCase()).first();
        
        if (existing) {
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

        // Create new user in D1
        const passwordHash = hashPassword(password);
        const displayUsername = username || email.split('@')[0];
        const now = new Date().toISOString();
        
        const result = await db.prepare(
            'INSERT INTO users (email, username, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(
            email.toLowerCase(),
            displayUsername,
            passwordHash,
            'customer',
            now,
            now
        ).run();

        if (!result.success) {
            throw new Error('Failed to create user');
        }

        // Get the created user
        const newUser = await db.prepare(
            'SELECT * FROM users WHERE email = ?'
        ).bind(email.toLowerCase()).first();

        return new Response(JSON.stringify({
            success: true,
            user: {
                email: newUser.email,
                username: newUser.username,
                role: newUser.role,
                isStaff: false,
                userId: newUser.id
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
            error: 'Registration failed. Please try again.',
            debug: error.message || String(error)
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}

async function verifySession(email, db) {
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
        const user = await db.prepare(
            'SELECT id FROM users WHERE email = ?'
        ).bind(email.toLowerCase()).first();

        return new Response(JSON.stringify({
            success: true,
            valid: !!user
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
