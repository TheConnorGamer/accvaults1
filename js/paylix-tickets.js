// Custom Ticket System (Database-backed)
class PaylixTicketSystem {
    constructor() {
        this.baseUrl = '/api/tickets-v2'; // Use custom ticket system
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
                    subject: title,
                    message: message
                })
            });

            const responseText = await response.text();
            console.log('Raw response status:', response.status);
            console.log('Raw response text:', responseText);
            console.log('Response OK?', response.ok);

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse response:', responseText);
                throw new Error('Failed to parse server response');
            }
            
            console.log('Parsed response data:', data);
            
            // Check if response has an error field
            if (data.error) {
                console.error('API returned error:', data.error);
                throw new Error(data.error);
            }
            
            // Check for success field
            if (data.success) {
                console.log('✅ Ticket created successfully');
                return data;
            }
            
            // If HTTP status is not ok, throw error
            if (!response.ok) {
                throw new Error(data.message || `Server error: ${response.status}`);
            }
            
            // If we get here, assume success
            console.log('✅ Assuming success');
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
            console.log('Tickets response:', data);
            
            // Custom ticket system returns data array directly
            if (data.success && Array.isArray(data.data)) {
                return data.data;
            }
            
            // No tickets found
            return [];
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
            return data.success ? data.data : data;
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
            'open': { color: '#f59e0b', text: 'Open', icon: 'clock' },
            'pending': { color: '#f59e0b', text: 'Pending', icon: 'clock' },
            'replied': { color: '#8359cf', text: 'Replied', icon: 'reply' },
            'closed': { color: '#6b7280', text: 'Closed', icon: 'check-circle' },
            // Legacy Paylix statuses
            'PENDING': { color: '#f59e0b', text: 'Pending', icon: 'clock' },
            'SHOP_REPLY': { color: '#8359cf', text: 'Shop Replied', icon: 'reply' },
            'CUSTOMER_REPLY': { color: '#3b82f6', text: 'Customer Replied', icon: 'comment' },
            'CLOSED': { color: '#6b7280', text: 'Closed', icon: 'check-circle' }
        };

        return statusConfig[status] || statusConfig['open'];
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
