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
      'database/migrations/009_create_tenants_and_tenant_scoping_users_roles.sql',
    );
    const sql = fs.readFileSync(migrationFile, 'utf-8');

    console.log('🔄 Ejecutando migración 009 (tenants + tenant scoping en roles/users)...');
    await client.query(sql);
    console.log('✅ Migración 009 ejecutada exitosamente');
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
