-- Create table for storing ticket transcripts
CREATE TABLE IF NOT EXISTS ticket_transcripts (
    ticket_id TEXT PRIMARY KEY,
    transcript_html TEXT NOT NULL,
    created_at INTEGER NOT NULL
);
