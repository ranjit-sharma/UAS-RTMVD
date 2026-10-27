// src/scripts/seedObservations.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Observation } from '../models/observation.model.js';
import { User } from '../models/user.model.js';
import { env } from '../config/env.js';

dotenv.config();

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI || env.mongoUri;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is required. Configure the MongoDB Atlas connection string in server/.env.');
    }
    await mongoose.connect(mongoUri, { sanitizeFilter: true });
    console.log('Connected to MongoDB:', mongoUri);

    let user = await User.findOne();
    if (!user) {
      user = await User.create({
        name: 'System Admin',
        email: 'admin@uas-rtmvd.local',
        passwordHash: '$2b$12$DUMMY_HASH_FOR_SEED_ONLY_DO_NOT_USE_00000000000000000',
        role: 'admin',
        isActive: true,
      });
    }

    const dummyRecords = [];
    const now = Date.now();

    // Generate 30 custom dummy observation telemetry points
    for (let i = 0; i < 30; i++) {
      const altitude = i * 500; // 0m to 14,500m
      const temp = 25 - (i * 2.2) + (Math.random() * 1.5 - 0.75); // Temp drops with altitude
      const press = Math.max(10, 1013.25 * Math.pow(1 - (2.25577e-5 * altitude), 5.25588));
      const hum = Math.max(5, Math.min(95, 80 - (i * 2) + (Math.random() * 10 - 5)));
      const windSpeed = 5 + (i * 1.2) + (Math.random() * 3);
      const windDir = (180 + i * 5 + Math.random() * 10) % 360;

      dummyRecords.push({
        altitude: parseFloat(altitude.toFixed(1)),
        temperature: parseFloat(temp.toFixed(1)),
        pressure: parseFloat(press.toFixed(1)),
        humidity: parseFloat(hum.toFixed(1)),
        windSpeed: parseFloat(windSpeed.toFixed(1)),
        windDirection: parseFloat(windDir.toFixed(0)),
        recordedAt: new Date(now - (30 - i) * 60000), // 1 minute apart
        source: 'manual',
        createdBy: user._id,
      });
    }

    const inserted = await Observation.insertMany(dummyRecords);
    console.log(`Successfully inserted ${inserted.length} custom dummy observation records!`);
  } catch (err) {
    console.error('Failed to seed observations:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

seed();
