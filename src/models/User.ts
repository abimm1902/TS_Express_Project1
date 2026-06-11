import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, Role, Permission, ROLE_PERMISSIONS } from '../types';

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.CASHIER,
    },
    permissions: {
      type: [String],
      enum: Object.values(Permission),
      default: [],
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret['password'] = undefined;
        return ret;
      },
    },
  }
);

// ─── Pre-save: hash password ──────────────────────────────────────────────────
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);

  // Assign default permissions based on role if not overridden
  if (this.isModified('role') || this.permissions.length === 0) {
    this.permissions = ROLE_PERMISSIONS[this.role] as Permission[];
  }
  next();
});

// ─── Method: compare password ─────────────────────────────────────────────────
UserSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

// ─── Indexes ──────────────────────────────────────────────────────────────────
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

export default mongoose.model<IUser>('User', UserSchema);
