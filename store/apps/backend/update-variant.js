const { Client } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL not found in env');
  process.exit(1);
}

async function main() {
  const client = new Client({
    connectionString,
    ssl: connectionString.includes('railway.net') ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    try {
      const apiKeysRes = await client.query("SELECT id, title, token, type FROM api_key;");
      console.log('API Keys in database:');
      apiKeysRes.rows.forEach(row => {
        console.log(`- Title: ${row.title}, Type: ${row.type}, Token/Key: ${row.token || row.id}`);
      });
    } catch (err) {
      console.error('Error fetching API keys:', err.message);
    }

    const res = await client.query("SELECT id, sku, title, metadata FROM product_variant ORDER BY created_at ASC LIMIT 10;");
    console.log('Current product variants in database:');
    res.rows.forEach(row => {
      console.log(`- ID: ${row.id}, SKU: ${row.sku}, Title: ${row.title}, Metadata:`, row.metadata);
    });

    if (res.rows.length === 0) {
      console.warn('No product variants found in database.');
      return;
    }

    const targetVariant = res.rows.find(row => row.sku === 'SHIRT-S-BLACK') || res.rows[0];
    console.log(`Updating variant ${targetVariant.sku} (${targetVariant.id})...`);

    const updatedMetadata = {
      ...(targetVariant.metadata || {}),
      pod_product_id: "6a309fc8d7e17dbff90c0017",
      pod_variant_id: 79116
    };

    await client.query(
      'UPDATE product_variant SET metadata = $1 WHERE id = $2;',
      [JSON.stringify(updatedMetadata), targetVariant.id]
    );

    console.log('Update complete!');

    const verifyRes = await client.query('SELECT id, sku, metadata FROM product_variant WHERE id = $1;', [targetVariant.id]);
    console.log('Verified updated variant:', verifyRes.rows[0]);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

main();
