const { Client } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config({ path: path.resolve(__dirname, '..', '.env.example') });
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is required.');
  process.exit(1);
}

const parsedUrl = new URL(databaseUrl);
const targetDatabase = parsedUrl.pathname.replace(/^\//, '');

if (!targetDatabase) {
  console.error('DATABASE_URL must include a database name.');
  process.exit(1);
}

const adminDatabase = process.env.PG_ADMIN_DB || 'postgres';
const adminUrl = new URL(databaseUrl);
adminUrl.pathname = `/${adminDatabase}`;

const quoteIdentifier = (value) => `"${value.replace(/"/g, '""')}"`;

async function ensureDatabase() {
  const client = new Client({
    connectionString: adminUrl.toString(),
  });

  await client.connect();

  try {
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [targetDatabase],
    );

    if (result.rowCount && result.rowCount > 0) {
      console.log(`Database "${targetDatabase}" already exists.`);
      return;
    }

    await client.query(`CREATE DATABASE ${quoteIdentifier(targetDatabase)}`);
    console.log(`Database "${targetDatabase}" created successfully.`);
  } finally {
    await client.end();
  }
}

ensureDatabase().catch((error) => {
  console.error('Failed to ensure database:', error.message);
  process.exit(1);
});
