// Paylix Ticket System Integration (via Backend API)
class PaylixTicketSystem {
    constructor() {
        this.baseUrl = '/api/tickets'; // Use backend API endpoints
    }

    // Create a new ticket
    async createTicket(email, title, message) {
        try {
            const response = await fetch(`${this.baseUrl}/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    title: title,
                    message: message
                })
            });

            const responseText = await response.text();
            console.log('Raw response:', responseText);

            if (!response.ok) {
                let errorData;
                try {
                    errorData = JSON.parse(responseText);
                } catch (e) {
                    console.error('Failed to parse error response:', responseText);
                    throw new Error('Failed to create ticket - Invalid server response');
                }
                console.error('API error:', errorData);
                throw new Error(errorData.error || 'Failed to create ticket');
            }

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse success response:', responseText);
                throw new Error('Failed to parse server response');
            }
            return data;
        } catch (error) {
            console.error('Error creating ticket:', error);
            throw error;
        }
    }

    // Get all tickets for a user
    async getTickets(email) {
        try {
            const response = await fetch(`${this.baseUrl}/list?email=${encodeURIComponent(email)}`, {
                method: 'GET'
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API error:', errorData);
                throw new Error(errorData.error || 'Failed to fetch tickets');
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
            const response = await fetch(`${this.baseUrl}/${uniquid}`, {
                method: 'GET'
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API error:', errorData);
                throw new Error(errorData.error || 'Failed to fetch ticket');
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
            const response = await fetch(`${this.baseUrl}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ticketId: uniquid,
                    reply: reply
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API error:', errorData);
                throw new Error(errorData.error || 'Failed to reply to ticket');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error replying to ticket:', error);
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

// Export for use in contact page
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaylixTicketSystem;
}
