import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..', '..');
const schemaFile = path.join(rootDir, 'database', 'schema.sql');
const migrationsDir = path.join(rootDir, 'database', 'migrations');

const run = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
  });

  try {
    const schemaSql = await fs.readFile(schemaFile, 'utf-8');
    await connection.query(schemaSql);

    await connection.query(`USE \`${process.env.DB_NAME}\``);
    await connection.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
        migration_name VARCHAR(255) PRIMARY KEY,
        applied_at DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP())
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    );

    const files = (await fs.readdir(migrationsDir))
      .filter((name) => name.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const [existing] = await connection.query(
        'SELECT migration_name FROM schema_migrations WHERE migration_name = ? LIMIT 1',
        [file]
      );

      if (existing.length > 0) {
        console.log(`↷ Skipping already applied migration: ${file}`);
        continue;
      }

      const sql = await fs.readFile(path.join(migrationsDir, file), 'utf-8');
      await connection.query(sql);
      await connection.query('INSERT INTO schema_migrations (migration_name) VALUES (?)', [file]);
      console.log(`✓ Applied migration: ${file}`);
    }

    console.log('✅ Database schema + migrations are up to date.');
  } finally {
    await connection.end();
  }
};

run().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
