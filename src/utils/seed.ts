

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User';
import Category from '../models/Category';
import { Role, ROLE_PERMISSIONS } from '../types';

const seed = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI not set'); process.exit(1); }

  await mongoose.connect(uri);
  console.log('✅  Connected to MongoDB');

  // ─── Super Admin ────────────────────────────────────────────────────────────
  const existing = await User.findOne({ email: 'admin@pos.com' });
  if (!existing) {
    await User.create({
      name: 'Super Admin',
      email: 'admin@pos.com',
      password: 'Admin@1234',
      role: Role.SUPER_ADMIN,
      permissions: ROLE_PERMISSIONS[Role.SUPER_ADMIN],
    });
    console.log('✅  Super Admin created → admin@pos.com / Admin@1234');
  } else {
    console.log('ℹ️   Super Admin already exists');
  }

  // ─── Sample Categories ───────────────────────────────────────────────────────
  const admin = await User.findOne({ email: 'admin@pos.com' });
  const categories = ['Electronics', 'Beverages', 'Snacks', 'Stationery', 'Clothing'];
  for (const name of categories) {
    const exists = await Category.findOne({ name });
    if (!exists) {
      await Category.create({ name, description: `${name} category`, createdBy: admin!._id });
      console.log(`✅  Category created: ${name}`);
    }
  }

  console.log('\n🎉  Seed complete!\n');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });

