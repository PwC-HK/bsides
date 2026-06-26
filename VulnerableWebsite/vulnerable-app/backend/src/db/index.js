const { Pool, Client } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const query = async (text, params) => {
  if (!params) {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    try {
      return await client.query(text);
    } finally {
      await client.end();
    }
  }
  return pool.query(text, params);
};

module.exports = { query, pool };
