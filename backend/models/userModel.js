import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true, // Index for fast login lookups
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters long'],
      required: [true, 'Password is required'],
    },
    fullName: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['customer', 'admin'], // Defines the user's role
      default: 'customer',
      index: true, // Index for fast filtering by role
    },
    image: {
      type: String,
      trim: true, // URL or path to the user's profile image
    },
    provider: {
      name: {
        type: String,
        enum: ['google', 'apple', 'microsoft'],
      },
      providerId: {
        type: String,
        unique: true,
        sparse: true,
      },
    },
    //
    phoneNumber: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    area: {
      type: String,
      trim: true,
    },
    street: {
      type: String,
      trim: true,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    resetPasswordAttempts: {
      type: Number,
      default: 0,
    },
    lastResetRequest: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index for social logins
UserSchema.index(
  { 'provider.providerId': 1, 'provider.name': 1 },
  { unique: true, sparse: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = bcrypt.hashSync(this.password, 10);
  next();
});
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
};

UserSchema.methods.generateResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  return token;
};
UserSchema.methods.clearResetToken = function () {
  this.resetPasswordToken = null;
  this.resetPasswordExpires = null;
  this.resetPasswordAttempts = 0;
};
// Method to check if the password has been changed after a specific date
UserSchema.methods.passwordChangedAfter = function (JWTTimestamp) {
  if (!this.passwordChangedAt) {
    return false;
  }

  const changedTimestamp = parseInt(
    this.passwordChangedAt.getTime() / 1000,
    10
  );

  console.log('Token issued at:', JWTTimestamp);
  console.log('Password changed at:', changedTimestamp);

  return JWTTimestamp < changedTimestamp;
};

export default mongoose.model('User', UserSchema);
