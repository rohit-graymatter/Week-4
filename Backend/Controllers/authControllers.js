import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../Models/userModel.js';
import redisClient from '../utils/redisClient.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const TOKEN_EXPIRY = 60 * 60 * 24; // 1 day in seconds

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

    await redisClient.set(`session:${user._id}`, token, { EX: TOKEN_EXPIRY });

    // ✅ Track register analytics
    await redisClient.incr('analytics:registers');

    res.status(201).json({ user: { id: user._id, name, email }, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

    await redisClient.set(`session:${user._id}`, token, { EX: TOKEN_EXPIRY });

    // ✅ Track login analytics
    await redisClient.incr('analytics:logins');

    res.status(200).json({ user: { id: user._id, name: user.name, email }, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
