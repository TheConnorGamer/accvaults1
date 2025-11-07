// Paylix Ticket System Integration (Direct API calls)
class PaylixTicketSystem {
    constructor(apiKey, merchantName) {
        this.apiKey = apiKey;
        this.merchantName = merchantName;
        this.baseUrl = 'https://dev.paylix.gg/v1'; // Direct Paylix API
    }

    // Create a new ticket
    async createTicket(email, title, message) {
        try {
            const response = await fetch(`${this.baseUrl}/queries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    customer_email: email,
                    title: title,
                    message: message
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Paylix API error:', errorText);
                throw new Error('Failed to create ticket');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error creating ticket:', error);
            throw error;
        }
    }

    // Get all tickets for a user
    async getTickets(email) {
        try {
            const response = await fetch(`${this.baseUrl}/queries?customer_email=${encodeURIComponent(email)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Paylix API error:', errorText);
                throw new Error('Failed to fetch tickets');
            }

            const data = await response.json();
            return data.data?.queries || [];
        } catch (error) {
            console.error('Error fetching tickets:', error);
            throw error;
        }
    }

    // Get a specific ticket by uniquid
    async getTicket(uniquid) {
        try {
            const response = await fetch(`${this.baseUrl}/queries/${uniquid}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Paylix API error:', errorText);
                throw new Error('Failed to fetch ticket');
            }

            const data = await response.json();
            return data.data?.query || data;
        } catch (error) {
            console.error('Error fetching ticket:', error);
            throw error;
        }
    }

    // Reply to a ticket
    async replyToTicket(uniquid, reply) {
        try {
            const response = await fetch(`${this.baseUrl}/queries/reply/${uniquid}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    reply: reply
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Paylix API error:', errorText);
                throw new Error('Failed to reply to ticket');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error replying to ticket:', error);
            throw error;
        }
    }

    // Close a ticket
    async closeTicket(uniquid) {
        try {
            const response = await fetch(`${this.baseUrl}/queries/close/${uniquid}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to close ticket');
            }

            return await response.json();
        } catch (error) {
            console.error('Error closing ticket:', error);
            throw error;
        }
    }

    // Reopen a ticket
    async reopenTicket(uniquid) {
        try {
            const response = await fetch(`${this.baseUrl}/queries/reopen/${uniquid}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to reopen ticket');
            }

            return await response.json();
        } catch (error) {
            console.error('Error reopening ticket:', error);
            throw error;
        }
    }

    // Format ticket status for display
    getStatusBadge(status) {
        const statusConfig = {
            'PENDING': { color: '#f59e0b', text: 'Pending', icon: 'clock' },
            'SHOP_REPLY': { color: '#8359cf', text: 'Shop Replied', icon: 'reply' },
            'CUSTOMER_REPLY': { color: '#3b82f6', text: 'Customer Replied', icon: 'comment' },
            'CLOSED': { color: '#6b7280', text: 'Closed', icon: 'check-circle' }
        };

        return statusConfig[status] || statusConfig['PENDING'];
    }

    // Format date
    formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Initialize ticket system (will be configured with actual API key)
let ticketSystem = null;

function initTicketSystem() {
    // Get API key from environment or config
    const apiKey = 'YOUR_API_KEY'; // Replace with actual API key
    const merchantName = 'AccVaults';
    
    ticketSystem = new PaylixTicketSystem(apiKey, merchantName);
}

// Export for use in contact page
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaylixTicketSystem;
}
