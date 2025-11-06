// Customer Dashboard
const user = JSON.parse(localStorage.getItem('accvaults_user') || 'null');

// Check if user is logged in
if (!user || !user.loggedIn) {
    window.location.href = 'index.html';
}

// Update sidebar email
document.getElementById('sidebarEmail').textContent = user.email;

// Update login button
document.addEventListener('DOMContentLoaded', () => {
    if (typeof updateLoginButton === 'function') {
        updateLoginButton();
    }
    loadDashboardData();
});

async function loadDashboardData() {
    try {
        // Get customer orders from Paylix API
        const response = await fetch('/api/paylix-api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'getCustomerOrders',
                email: user.email 
            })
        });

        if (!response.ok) {
            showPlaceholderData();
            return;
        }

        const result = await response.json();
        if (!result.success) {
            showPlaceholderData();
            return;
        }

        // Paylix returns orders in different formats, try all possibilities
        let orders = [];
        if (Array.isArray(result.data)) {
            orders = result.data;
        } else if (result.data?.data?.orders) {
            orders = result.data.data.orders;
        } else if (result.data?.orders) {
            orders = result.data.orders;
        } else if (result.data?.data && Array.isArray(result.data.data)) {
            orders = result.data.data;
        }

        console.log('Orders found:', orders.length, orders);

        // Filter orders by email (in case API doesn't filter properly)
        orders = orders.filter(order => {
            const orderEmail = order.customer_email || order.email || '';
            return orderEmail.toLowerCase() === user.email.toLowerCase();
        });

        console.log('Orders after filtering by email:', orders.length);

        // Calculate stats
        const completedOrders = orders.filter(o => o.status === 'completed').length;
        const totalSpent = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
        
        // Update stats
        document.getElementById('completedOrders').textContent = completedOrders;
        document.getElementById('totalSpent').textContent = `£${totalSpent.toFixed(2)}`;
        
        // Customer since (from user registration or first order)
        if (user.created_at) {
            const date = new Date(user.created_at);
            document.getElementById('customerSince').textContent = date.toLocaleDateString('en-GB', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } else if (orders.length > 0) {
            const oldestOrder = orders.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0];
            const date = new Date(oldestOrder.created_at);
            document.getElementById('customerSince').textContent = date.toLocaleDateString('en-GB', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }

        // Display latest order
        if (orders.length > 0) {
            const latestOrder = orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
            document.getElementById('latestOrder').innerHTML = `
                <div class="order-card">
                    <div class="order-header">
                        <div>
                            <div class="order-title">${latestOrder.product_name || 'Order'}</div>
                            <div class="order-invoice">Invoice #${latestOrder.uniqid || latestOrder.id} - ${formatDate(latestOrder.created_at)}</div>
                        </div>
                        <span class="order-status status-${latestOrder.status}">${latestOrder.status}</span>
                    </div>
                </div>
            `;
        }

        // Display recent orders (last 5)
        const recentOrders = orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
        
        if (recentOrders.length > 0) {
            document.getElementById('recentOrders').innerHTML = recentOrders.map(order => `
                <div class="order-card">
                    <div class="order-header">
                        <div>
                            <div class="order-title">${order.product_name || 'Order'}</div>
                            <div class="order-invoice">Invoice #${order.uniqid || order.id} - ${formatDate(order.created_at)}</div>
                        </div>
                        <span class="order-status status-${order.status}">${order.status}</span>
                    </div>
                </div>
            `).join('');
        } else {
            document.getElementById('recentOrders').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No orders yet</p>
                </div>
            `;
        }

    } catch (error) {
        console.error('Dashboard load error:', error);
        showPlaceholderData();
    }
}

function showPlaceholderData() {
    // Show zeros when Paylix is not available
    document.getElementById('completedOrders').textContent = '0';
    document.getElementById('totalSpent').textContent = '£0.00';
    
    // Set customer since from user data
    if (user.created_at) {
        const date = new Date(user.created_at);
        document.getElementById('customerSince').textContent = date.toLocaleDateString('en-GB', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } else {
        document.getElementById('customerSince').textContent = 'Today';
    }

    document.getElementById('latestOrder').innerHTML = `
        <div class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>No orders yet</p>
        </div>
    `;

    document.getElementById('recentOrders').innerHTML = `
        <div class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>No orders yet</p>
        </div>
    `;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function handleCustomerLogout() {
    localStorage.removeItem('accvaults_user');
    showNotification('👋 You have been logged out.');
    window.location.href = 'index.html';
}
