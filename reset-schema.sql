-- Drop existing table and recreate
DROP TABLE IF EXISTS users;

-- Users table for authentication
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Index for faster email lookups
CREATE INDEX idx_users_email ON users(email);
