import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Validate database connection string
if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL not set. Please configure your database connection.');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Connection pool settings
  max: Number(process.env.DB_POOL_MAX) || 5, // keep small: each serverless instance has its own pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // serverless Postgres (Neon) may need a few seconds to wake up
});

// Test connection on startup
pool.on('error', (err) => {
  // Idle clients can be dropped by serverless Postgres; log and let the pool reconnect
  console.error('❌ Unexpected error on idle client', err);
});

/**
 * Initialize database schema
 * Creates tables and indexes if they don't exist
 */
export async function initDatabase() {
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection established');

    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS corn_purchases (
        id SERIAL PRIMARY KEY,
        client_id VARCHAR(255) NOT NULL,
        purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);

    // Create indexes for faster queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_client_time 
      ON corn_purchases(client_id, purchased_at DESC);
    `);

    // Additional index for client lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_client_id 
      ON corn_purchases(client_id);
    `);

    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

