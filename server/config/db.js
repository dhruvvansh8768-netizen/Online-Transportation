// ============================================
// config/db.js — PostgreSQL Connection Pool
// ============================================
// Uses node-postgres (pg) to create a reusable
// connection pool for all database operations.
// ============================================

const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool supporting both DATABASE_URL (cloud) and local env vars
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ridehailing_db',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    };

const pool = new Pool(poolConfig);

// Log successful pool connection
pool.on('connect', () => {
  console.log('[DB] New client connected to PostgreSQL');
});

// Log pool errors without crashing the server
pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

/**
 * Execute a parameterized SQL query against the pool.
 * @param {string} text - The SQL query string with $1, $2, ... placeholders
 * @param {Array} params - The parameter values for the query
 * @returns {Promise<object>} - The query result object from pg
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    // Log queries in development mode for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[DB Query]', { text: text.substring(0, 80), duration: `${duration}ms`, rows: result.rowCount });
    }
    return result;
  } catch (error) {
    console.error('[DB Query Error]', { text: text.substring(0, 80), error: error.message });
    throw error;
  }
};

/**
 * Get a client from the pool for transactions.
 * Remember to release the client after use!
 * @returns {Promise<object>} - A pg client from the pool
 */
const getClient = async () => {
  const client = await pool.connect();
  return client;
};

module.exports = { pool, query, getClient };
