import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import db from '../src/config/db.js';

dotenv.config();

const run = async () => {
  const name = process.env.SEED_ADMIN_NAME || 'CampusLoop Admin';
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required to seed admin user.');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(password, 12);

  const [existing] = await db.query('SELECT id FROM admin_users WHERE email = ? LIMIT 1', [normalizedEmail]);

  if (existing.length > 0) {
    await db.query(
      `UPDATE admin_users
       SET name = ?, password_hash = ?, status = 'ACTIVE', updated_at = NOW()
       WHERE id = ?`,
      [name, passwordHash, existing[0].id]
    );
    console.log(`✓ Updated admin account: ${normalizedEmail}`);
    return;
  }

  await db.query(
    `INSERT INTO admin_users (name, email, password_hash, role, status)
     VALUES (?, ?, ?, 'ADMIN', 'ACTIVE')`,
    [name, normalizedEmail, passwordHash]
  );

  console.log(`✓ Created admin account: ${normalizedEmail}`);
};

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Admin seed failed:', err.message);
    process.exit(1);
  });
