const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL no está configurada');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    const migrationFile = path.join(
      __dirname,
      'database/migrations/023_create_campaign_recipients.sql',
    );
    const sql = fs.readFileSync(migrationFile, 'utf-8');

    console.log('🔄 Ejecutando migración 023 (bitácora de destinatarios por campaña)...');
    await client.query(sql);
    console.log('✅ Migración 023 ejecutada exitosamente');
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
