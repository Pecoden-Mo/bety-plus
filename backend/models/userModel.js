import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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

    // Social login IDs for customers
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
  },
  { timestamps: true }
);

// Compound index for social logins
UserSchema.index(
  { 'provider.providerId': 1, 'provider.name': 1 },
  { unique: true, sparse: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = bcrypt.hashSync(this.password, 10);
  next();
});
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
};

export default mongoose.model('User', UserSchema);
