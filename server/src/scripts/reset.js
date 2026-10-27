import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../models/user.model.js';

async function reset() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required. Configure the MongoDB Atlas connection string in server/.env.');
  }
  await mongoose.connect(process.env.MONGODB_URI);
  const hash = await bcrypt.hash('password123', 12);
  await User.updateMany({ email: { $in: ['admin@uas-rtmvd.local', 'admin@uass.local'] } }, { passwordHash: hash });
  console.log('Password reset to password123');
  process.exit(0);
}
reset();
