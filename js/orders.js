// Orders Page Functionality
const user = JSON.parse(localStorage.getItem('accvaults_user') || 'null');
let currentUserEmail = user?.email || '';

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    // Update login button in header
    if (typeof updateLoginButton === 'function') {
        updateLoginButton();
    }
    
    const lookupSection = document.querySelector('.order-lookup');
    
    if (currentUserEmail) {
        // User is logged in - show logged in UI
        if (lookupSection) {
            lookupSection.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; background: rgba(131, 89, 207, 0.1); border: 1px solid rgba(131, 89, 207, 0.3); border-radius: 12px; margin-bottom: 30px;">
                    <div>
                        <p style="color: rgba(255,255,255,0.7); margin: 0 0 5px 0; font-size: 14px;">Logged in as</p>
                        <p style="color: #fff; margin: 0; font-size: 16px; font-weight: 600;">
                            <i class="fas fa-user-circle" style="margin-right: 8px; color: #8359cf;"></i>
                            ${currentUserEmail}
                        </p>
                    </div>
                    <button onclick="logout()" style="padding: 10px 20px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.3s;">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            `;
        }
        loadOrders();
    } else {
        // User is logged out - show styled email input
        if (lookupSection) {
            lookupSection.innerHTML = `
                <div style="max-width: 600px; margin: 0 auto 40px;">
                    <div style="display: flex; gap: 12px;">
                        <input type="email" id="orderEmail" placeholder="Enter your email to view orders" required 
                            style="flex: 1; padding: 14px 18px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff; font-size: 15px; outline: none; transition: all 0.3s;">
                        <button onclick="loadOrders()" 
                            style="padding: 14px 28px; background: linear-gradient(135deg, #8359cf 0%, #5c3d99 100%); border: none; border-radius: 10px; color: #fff; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.3s; white-space: nowrap;">
                            <i class="fas fa-search" style="margin-right: 8px;"></i>Find Orders
                        </button>
                    </div>
                </div>
            `;
        }
    }
});

async function loadOrders() {
    const emailInput = document.getElementById('orderEmail');
    const email = emailInput ? emailInput.value : currentUserEmail;
    
    if (!email || !email.includes('@')) {
        showNotification('❌ Please enter a valid email address');
        return;
    }

    currentUserEmail = email;

    const loadingEl = document.getElementById('ordersLoading');
    const listEl = document.getElementById('ordersList');
    const emptyEl = document.getElementById('ordersEmpty');

    // Show loading
    if (loadingEl) loadingEl.style.display = 'flex';
    if (listEl) listEl.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'none';

    try {
        // Get customer orders from Paylix API
        const response = await fetch('/api/paylix-api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'getCustomerOrders',
                email: email 
            })
        });

        if (!response.ok) {
            if (loadingEl) loadingEl.style.display = 'none';
            if (emptyEl) emptyEl.style.display = 'flex';
            return;
        }

        const result = await response.json();
        if (!result.success) {
            if (loadingEl) loadingEl.style.display = 'none';
            if (emptyEl) emptyEl.style.display = 'flex';
            return;
        }

        const orders = result.data?.data?.orders || result.data?.orders || result.data || [];

        if (loadingEl) loadingEl.style.display = 'none';

        if (orders.length === 0) {
            if (emptyEl) emptyEl.style.display = 'flex';
            return;
        }

        // Display orders
        if (listEl) {
            listEl.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-id">
                        <i class="fas fa-hashtag"></i>
                        <span>Order ${order.uniqid || order.id}</span>
                    </div>
                    <div class="order-status ${getStatusClass(order.status)}">
                        <i class="${getStatusIcon(order.status)}"></i>
                        ${order.status || 'Pending'}
                    </div>
                </div>
                <div class="order-body">
                    <div class="order-info">
                        <div class="order-detail">
                            <i class="fas fa-calendar"></i>
                            <span>${formatDate(order.created_at)}</span>
                        </div>
                        <div class="order-detail">
                            <i class="fas fa-pound-sign"></i>
                            <span>£${(order.total || 0).toFixed(2)}</span>
                        </div>
                        ${order.product_name ? `
                            <div class="order-detail">
                                <i class="fas fa-box"></i>
                                <span>${order.product_name}</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="order-actions">
                        <button onclick="viewOrderDetails('${order.uniqid || order.id}')" class="order-btn">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                        ${order.status === 'completed' && order.download_url ? `
                            <a href="${order.download_url}" class="order-btn order-btn-primary" target="_blank">
                                <i class="fas fa-download"></i> Download
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
        }

    } catch (error) {
        if (loadingEl) loadingEl.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'flex';
        showNotification('❌ Failed to load orders. Please try again.');
        console.error('Load orders error:', error);
    }
}

async function viewOrderDetails(orderId) {
    try {
        const response = await fetch('/api/paylix-api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'getOrder',
                orderId: orderId 
            })
        });

        if (!response.ok) {
            showNotification('❌ Failed to load order details');
            return;
        }

        const result = await response.json();
        if (!result.success) {
            showNotification('❌ Failed to load order details');
            return;
        }

        const orderData = result.data?.data || result.data;
        
        const modal = document.createElement('div');
        modal.className = 'order-modal';
        modal.innerHTML = `
            <div class="order-modal-content">
                <button class="modal-close" onclick="this.closest('.order-modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
                <h2><i class="fas fa-receipt"></i> Order Details</h2>
                
                <div class="order-details">
                    <div class="detail-row">
                        <span class="detail-label">Order ID:</span>
                        <span class="detail-value">${orderData.uniqid || orderData.id}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value ${getStatusClass(orderData.status)}">
                            ${orderData.status}
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date:</span>
                        <span class="detail-value">${formatDate(orderData.created_at)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Total:</span>
                        <span class="detail-value">£${(orderData.total || 0).toFixed(2)}</span>
                    </div>
                    ${orderData.product_name ? `
                        <div class="detail-row">
                            <span class="detail-label">Product:</span>
                            <span class="detail-value">${orderData.product_name}</span>
                        </div>
                    ` : ''}
                    ${orderData.gateway ? `
                        <div class="detail-row">
                            <span class="detail-label">Payment Method:</span>
                            <span class="detail-value">${orderData.gateway}</span>
                        </div>
                    ` : ''}
                </div>

                ${orderData.status === 'completed' ? `
                    <div class="order-success">
                        <i class="fas fa-check-circle"></i>
                        <p>Your order has been completed successfully!</p>
                    </div>
                ` : ''}
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
        
    } catch (error) {
        showNotification('❌ Failed to load order details');
        console.error('View order error:', error);
    }
}

function getStatusClass(status) {
    const statusMap = {
        'completed': 'status-completed',
        'pending': 'status-pending',
        'processing': 'status-processing',
        'cancelled': 'status-cancelled',
        'refunded': 'status-refunded'
    };
    return statusMap[status?.toLowerCase()] || 'status-pending';
}

function getStatusIcon(status) {
    const iconMap = {
        'completed': 'fas fa-check-circle',
        'pending': 'fas fa-clock',
        'processing': 'fas fa-spinner fa-spin',
        'cancelled': 'fas fa-times-circle',
        'refunded': 'fas fa-undo'
    };
    return iconMap[status?.toLowerCase()] || 'fas fa-clock';
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function logout() {
    localStorage.removeItem('accvaults_user');
    currentUserEmail = '';
    window.location.reload();
}
