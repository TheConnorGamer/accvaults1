// Paylix API Client (Frontend)
class PaylixClient {
    constructor() {
        this.apiUrl = '/api/paylix-api';
    }

    async call(action, params = {}) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action, ...params })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'API call failed');
            }

            return data.data;
        } catch (error) {
            console.error('Paylix API Error:', error);
            throw error;
        }
    }

    // Product methods
    async getProducts() {
        return await this.call('getProducts');
    }

    async getProduct(productId) {
        return await this.call('getProduct', { productId });
    }

    // Order methods
    async getOrders() {
        return await this.call('getOrders');
    }

    async getOrder(orderId) {
        return await this.call('getOrder', { orderId });
    }

    async getCustomerOrders(email) {
        return await this.call('getCustomerOrders', { email });
    }

    // Review methods
    async getReviews() {
        return await this.call('getReviews');
    }

    // Coupon methods
    async validateCoupon(code) {
        return await this.call('validateCoupon', { code });
    }

    // Analytics methods
    async getStats() {
        return await this.call('getStats');
    }

    // Payment methods
    async createPayment(cart, email, couponCode = null, returnUrl = window.location.origin) {
        return await this.call('createPayment', { cart, email, couponCode, returnUrl });
    }

    // Security methods
    async checkBlacklist(email) {
        return await this.call('checkBlacklist', { email });
    }
}

// Create global instance
window.paylixClient = new PaylixClient();
