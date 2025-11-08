// Serve ticket transcript HTML
export async function onRequestGet(context) {
    const { params, env } = context;
    const ticketId = params.ticketId;
    
    if (!ticketId) {
        return new Response('Ticket ID required', { status: 400 });
    }
    
    try {
        // Get transcript from database
        const { results } = await env.DB.prepare(
            'SELECT transcript_html FROM ticket_transcripts WHERE ticket_id = ?'
        ).bind(ticketId).all();
        
        if (results.length === 0) {
            return new Response('Transcript not found', { status: 404 });
        }
        
        const transcriptHtml = results[0].transcript_html;
        
        // Return HTML with download headers
        return new Response(transcriptHtml, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Content-Disposition': `attachment; filename="ticket-${ticketId}-transcript.html"`,
                'Cache-Control': 'public, max-age=31536000'
            }
        });
    } catch (error) {
        console.error('Error fetching transcript:', error);
        return new Response('Error fetching transcript', { status: 500 });
    }
}
