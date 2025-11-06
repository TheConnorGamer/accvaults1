// Dashboard Analytics
async function loadDashboard() {
    try {
        // Check if Paylix client is available
        if (!window.paylixClient || !window.paylixClient.getStats) {
            // Show placeholder data when Paylix is not available
            document.getElementById('totalOrders').textContent = '0';
            document.getElementById('totalRevenue').textContent = '£0.00';
            document.getElementById('totalProducts').textContent = '0';
            document.getElementById('totalCustomers').textContent = '0';
            
            const ordersContainer = document.getElementById('recentOrders');
            ordersContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No orders yet</p>
                </div>
            `;
            return;
        }
        
        // Load stats
        const stats = await window.paylixClient.getStats();
        
        document.getElementById('totalOrders').textContent = stats.totalOrders || 0;
        document.getElementById('totalRevenue').textContent = `£${(stats.totalRevenue || 0).toFixed(2)}`;
        document.getElementById('totalProducts').textContent = stats.totalProducts || 0;
        document.getElementById('totalCustomers').textContent = stats.totalCustomers || 0;

        // Load recent orders
        const orders = await window.paylixClient.getOrders();
        const recentOrders = (orders.data || []).slice(0, 10);

        const ordersContainer = document.getElementById('recentOrders');
        
        if (recentOrders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No orders yet</p>
                </div>
            `;
            return;
        }

        ordersContainer.innerHTML = recentOrders.map(order => `
            <div class="recent-order-item">
                <div class="order-icon">
                    <i class="fas fa-shopping-bag"></i>
                </div>
                <div class="order-info">
                    <h4>#${order.uniqid || order.id}</h4>
                    <p>${order.product_name || 'Product'}</p>
                </div>
                <div class="order-meta">
                    <span class="order-amount">£${(order.total || 0).toFixed(2)}</span>
                    <span class="order-status ${getStatusClass(order.status)}">
                        ${order.status || 'Pending'}
                    </span>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Dashboard load error:', error);
        // Show placeholder data on error
        document.getElementById('totalOrders').textContent = '0';
        document.getElementById('totalRevenue').textContent = '£0.00';
        document.getElementById('totalProducts').textContent = '0';
        document.getElementById('totalCustomers').textContent = '0';
        
        const ordersContainer = document.getElementById('recentOrders');
        if (ordersContainer) {
            ordersContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No orders yet</p>
                </div>
            `;
        }
    }
}

function getStatusClass(status) {
    const statusMap = {
        'completed': 'status-completed',
        'pending': 'status-pending',
        'processing': 'status-processing',
        'cancelled': 'status-cancelled'
    };
    return statusMap[status?.toLowerCase()] || 'status-pending';
}

// Load dashboard on page load
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    
    // Refresh every 30 seconds
    setInterval(loadDashboard, 30000);
});
