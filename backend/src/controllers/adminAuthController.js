import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const generateAdminToken = (admin) => jwt.sign(
  { adminId: admin.admin_id, email: admin.email, role: 'admin' },
  process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET,
  { expiresIn: process.env.ADMIN_JWT_EXPIRE || '1d' }
);

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const [rows] = await pool.execute(
      'SELECT admin_id, email, password_hash, created_at FROM admins WHERE email = ?',
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const admin = rows[0];
    const validPassword = await bcrypt.compare(password, admin.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const token = generateAdminToken(admin);
    return res.status(200).json({
      message: 'Admin login successful',
      token,
      admin: {
        _id: admin.admin_id,
        email: admin.email,
        createdAt: admin.created_at,
      },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ message: 'Server error during admin login' });
  }
};
