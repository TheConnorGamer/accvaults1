// Ticket System JavaScript

let currentTicketId = null;
let currentTicketStatus = null;
let autoRefreshInterval = null;

function switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.closest('.tab').classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    if (tab === 'create') {
        document.getElementById('createTab').classList.add('active');
    } else {
        document.getElementById('viewTab').classList.add('active');
    }
}

async function createTicket(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const subject = document.getElementById('title').value;
    const message = document.getElementById('message').value;
    const createBtn = document.getElementById('createBtn');
    const alertDiv = document.getElementById('createAlert');
    
    // Disable button and show loading
    createBtn.disabled = true;
    createBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    
    try {
        const response = await fetch('/api/tickets-v2/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                subject: subject,
                message: message
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            const ticketId = data.data.ticket_id;
            const customerEmail = data.data.customer_email;
            
            alertDiv.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i>
                    Ticket created successfully! Ticket ID: ${ticketId}
                </div>
            `;
            document.getElementById('createTicketForm').reset();
            
            // Auto-switch to My Tickets tab and show the ticket
            setTimeout(() => {
                switchTab('view');
                document.getElementById('viewEmail').value = customerEmail;
                loadTickets();
            }, 1500);
        } else {
            alertDiv.innerHTML = `
                <div class="alert alert-error">
                    <i class="fas fa-exclamation-circle"></i>
                    ${data.error || 'Failed to create ticket'}
                </div>
            `;
        }
    } catch (error) {
        alertDiv.innerHTML = `
            <div class="alert alert-error">
                <i class="fas fa-exclamation-circle"></i>
                Error: ${error.message}
            </div>
        `;
    } finally {
        createBtn.disabled = false;
        createBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Create Ticket';
    }
}

async function loadTickets() {
    const email = document.getElementById('viewEmail').value;
    const container = document.getElementById('ticketsList');

    if (!email) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-envelope"></i>
                <h3>Enter your email</h3>
                <p>Please enter your email address to view your tickets</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Loading tickets...</p></div>';

    try {
        const response = await fetch(`/api/tickets-v2/list?email=${encodeURIComponent(email)}`);
        const data = await response.json();

        if (data.success && data.data && data.data.length > 0) {
            displayTickets(data.data);
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>No tickets found</h3>
                    <p>You haven't created any support tickets yet</p>
                </div>
            `;
        }
    } catch (error) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error loading tickets</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

function displayTickets(tickets) {
    const container = document.getElementById('ticketsList');
    container.innerHTML = `
        <div class="tickets-list">
            ${tickets.map(ticket => {
                const messageCount = ticket.message_count || ticket.messages?.length || 1;
                const preview = ticket.message || ticket.subject || 'No preview available';
                const previewText = preview.substring(0, 150) + (preview.length > 150 ? '...' : '');
                
                return `
                    <div class="ticket-card" onclick="openTicket('${ticket.ticket_id}')">
                        <div class="ticket-card-header">
                            <div>
                                <div class="ticket-title">${ticket.subject || 'Untitled'}</div>
                                <div class="ticket-id">#${ticket.ticket_id}</div>
                            </div>
                            <span class="ticket-status status-${ticket.status}">${ticket.status}</span>
                        </div>
                        <div class="ticket-meta">
                            <span><i class="fas fa-clock"></i> ${formatDate(ticket.created_at)}</span>
                            <span><i class="fas fa-comments"></i> ${messageCount} message${messageCount !== 1 ? 's' : ''}</span>
                        </div>
                        <div class="ticket-preview">${previewText}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

async function openTicket(ticketId) {
    currentTicketId = ticketId;
    const modal = document.getElementById('ticketModal');
    if (!modal) {
        console.error('Modal element not found');
        return;
    }
    modal.classList.add('show');

    try {
        const response = await fetch(`/api/tickets-v2/${ticketId}`);
        const data = await response.json();

        if (data.success && data.data) {
            const ticket = data.data;
            currentTicketStatus = ticket.status;

            // Safely update elements with null checks
            const titleEl = document.getElementById('modalTicketTitle');
            const idEl = document.getElementById('modalTicketId');
            const emailEl = document.getElementById('modalTicketEmail');
            const dateEl = document.getElementById('modalTicketDate');
            const statusEl = document.getElementById('modalTicketStatus');
            const messagesContainer = document.getElementById('messagesContainer');
            const replyFormContainer = document.getElementById('replyFormContainer');
            const closedFormContainer = document.getElementById('closedFormContainer');

            if (titleEl) titleEl.textContent = ticket.subject;
            if (idEl) idEl.textContent = `#${ticket.ticket_id}`;
            if (emailEl) emailEl.textContent = ticket.customer_email;
            if (dateEl) dateEl.textContent = formatDate(ticket.created_at);
            if (statusEl) statusEl.innerHTML = `<span class="ticket-status status-${ticket.status}">${ticket.status}</span>`;

            // Display messages
            if (messagesContainer) {
                const messages = ticket.messages || [{ message: ticket.message, created_at: ticket.created_at, sender_type: 'customer' }];
                
                messagesContainer.innerHTML = messages.map(msg => `
                    <div class="message ${msg.sender_type || 'customer'}">
                        <div class="message-bubble">
                            <div class="message-header">
                                <span class="message-sender">
                                    ${msg.sender_type === 'support' ? '<i class="fas fa-headset"></i> Support Team' : '<i class="fas fa-user"></i> You'}
                                </span>
                                <span class="message-time">${formatDate(msg.created_at)}</span>
                            </div>
                            <div class="message-content">${msg.message}</div>
                        </div>
                    </div>
                `).join('');
                
                // Scroll to bottom
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }

            // Show/hide reply form based on status
            if (ticket.status === 'closed') {
                if (replyFormContainer) replyFormContainer.style.display = 'none';
                if (closedFormContainer) closedFormContainer.style.display = 'block';
            } else {
                if (replyFormContainer) replyFormContainer.style.display = 'block';
                if (closedFormContainer) closedFormContainer.style.display = 'none';
            }
            
            // Start auto-refresh for real-time updates (every 5 seconds)
            startAutoRefresh();
        } else {
            alert('Failed to load ticket details: ' + (data.error || 'Unknown error'));
            closeModal();
        }
    } catch (error) {
        console.error('Error loading ticket:', error);
        alert('Failed to load ticket details: ' + error.message);
        closeModal();
    }
}

async function refreshTicketMessages() {
    if (!currentTicketId) return;
    
    try {
        const response = await fetch(`/api/tickets-v2/${currentTicketId}`);
        const data = await response.json();

        if (data.success && data.data) {
            const ticket = data.data;
            const messagesContainer = document.getElementById('messagesContainer');
            const statusEl = document.getElementById('modalTicketStatus');
            
            // Update status if changed
            if (statusEl && ticket.status !== currentTicketStatus) {
                currentTicketStatus = ticket.status;
                statusEl.innerHTML = `<span class="ticket-status status-${ticket.status}">${ticket.status}</span>`;
                
                // Update form visibility
                const replyFormContainer = document.getElementById('replyFormContainer');
                const closedFormContainer = document.getElementById('closedFormContainer');
                if (ticket.status === 'closed') {
                    if (replyFormContainer) replyFormContainer.style.display = 'none';
                    if (closedFormContainer) closedFormContainer.style.display = 'block';
                } else {
                    if (replyFormContainer) replyFormContainer.style.display = 'block';
                    if (closedFormContainer) closedFormContainer.style.display = 'none';
                }
            }
            
            // Update messages
            if (messagesContainer) {
                const messages = ticket.messages || [{ message: ticket.message, created_at: ticket.created_at, sender_type: 'customer' }];
                const currentScroll = messagesContainer.scrollTop;
                const isScrolledToBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop <= messagesContainer.clientHeight + 50;
                
                messagesContainer.innerHTML = messages.map(msg => `
                    <div class="message ${msg.sender_type || 'customer'}">
                        <div class="message-bubble">
                            <div class="message-header">
                                <span class="message-sender">
                                    ${msg.sender_type === 'support' ? '<i class="fas fa-headset"></i> Support Team' : '<i class="fas fa-user"></i> You'}
                                </span>
                                <span class="message-time">${formatDate(msg.created_at)}</span>
                            </div>
                            <div class="message-content">${msg.message}</div>
                        </div>
                    </div>
                `).join('');
                
                // Auto-scroll to bottom if user was already at bottom
                if (isScrolledToBottom) {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
            }
        }
    } catch (error) {
        console.error('Error refreshing ticket:', error);
    }
}

function startAutoRefresh() {
    // Clear any existing interval
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    // Refresh every 5 seconds
    autoRefreshInterval = setInterval(refreshTicketMessages, 5000);
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
}

async function sendReply() {
    const message = document.getElementById('replyMessage').value.trim();
    const alert = document.getElementById('modalAlert');

    if (!message) {
        alert.innerHTML = `
            <div class="alert alert-error">
                <i class="fas fa-exclamation-circle"></i>
                <span>Please enter a reply message</span>
            </div>
        `;
        return;
    }

    try {
        const response = await fetch('/api/tickets-v2/reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ticketId: currentTicketId,
                message: message,
                senderType: 'customer',
                senderEmail: document.getElementById('modalTicketEmail').textContent
            })
        });

        const data = await response.json();

        if (data.success) {
            alert.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i>
                    <span>Reply sent successfully!</span>
                </div>
            `;
            document.getElementById('replyMessage').value = '';
            // Immediately refresh messages
            await refreshTicketMessages();
            setTimeout(() => {
                alert.innerHTML = '';
            }, 3000);
        } else {
            throw new Error(data.error || 'Failed to send reply');
        }
    } catch (error) {
        alert.innerHTML = `
            <div class="alert alert-error">
                <i class="fas fa-exclamation-circle"></i>
                <span>${error.message}</span>
            </div>
        `;
    }
}

async function closeTicket() {
    if (!confirm('Are you sure you want to close this ticket?')) {
        return;
    }

    const alert = document.getElementById('modalAlert');

    try {
        const response = await fetch('/api/tickets-v2/close', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticketId: currentTicketId })
        });

        const data = await response.json();

        if (data.success) {
            alert.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i>
                    <span>Ticket closed successfully!</span>
                </div>
            `;
            setTimeout(() => {
                openTicket(currentTicketId); // Reload ticket
                alert.innerHTML = '';
            }, 1500);
        } else {
            throw new Error(data.error || 'Failed to close ticket');
        }
    } catch (error) {
        alert.innerHTML = `
            <div class="alert alert-error">
                <i class="fas fa-exclamation-circle"></i>
                <span>${error.message}</span>
            </div>
        `;
    }
}

async function reopenTicket() {
    const alert = document.getElementById('modalAlert');

    try {
        const response = await fetch('/api/tickets-v2/reopen', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticketId: currentTicketId })
        });

        const data = await response.json();

        if (data.success) {
            alert.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i>
                    <span>Ticket reopened successfully!</span>
                </div>
            `;
            setTimeout(() => {
                openTicket(currentTicketId); // Reload ticket
                alert.innerHTML = '';
            }, 1500);
        } else {
            throw new Error(data.error || 'Failed to reopen ticket');
        }
    } catch (error) {
        alert.innerHTML = `
            <div class="alert alert-error">
                <i class="fas fa-exclamation-circle"></i>
                <span>${error.message}</span>
            </div>
        `;
    }
}

function closeModal() {
    stopAutoRefresh(); // Stop auto-refresh when closing modal
    document.getElementById('ticketModal').classList.remove('show');
    document.getElementById('replyMessage').value = '';
    document.getElementById('modalAlert').innerHTML = '';
    currentTicketId = null;
}

function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('ticketModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'ticketModal') {
                closeModal();
            }
        });
    }
    
    // Add Enter key to send reply (Shift+Enter for new line)
    const replyTextarea = document.getElementById('replyMessage');
    if (replyTextarea) {
        replyTextarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendReply();
            }
        });
    }
});
