import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters long'],
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      required: true,
      enum: ['customer', 'admin', 'company'],
      default: 'customer',
      index: true,
    },
    image: {
      type: String,
      trim: true,
      default: function () {
        if (this.role === 'company') {
          return 'https://res.cloudinary.com/dmm1ewnt6/image/upload/v1757679007/companies/licenses/jt5rlumyfi8lj5xh9xwg.png';
        }
        return null; // No default for other roles
      },
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
    // Additional profile fields must when booking
    fullName: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: [String],
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
    houseNumber: {
      type: String,
      trim: true,
    },
    nationality: {
      type: String,
      trim: true,
    },
    passportImage: {
      type: String,
      trim: true,
    },

    // for password reset
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
    stripeCustomerId: {
      type: String,
      sparse: true,
      index: true,
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
  {
    unique: true,
    partialFilterExpression: {
      'provider.providerId': { $exists: true, $ne: null },
    },
  }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);
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

  return JWTTimestamp < changedTimestamp;
};

// Pre-save middleware to set default image based on role
UserSchema.pre('save', function (next) {
  // Only set default image if no image is provided and user is new
  if (this.isNew && !this.image) {
    if (this.role === 'company') {
      this.image =
        'https://res.cloudinary.com/dmm1ewnt6/image/upload/v1757679007/companies/licenses/jt5rlumyfi8lj5xh9xwg.png';
    } else if (this.role === 'admin' || this.role === 'customer') {
      this.image =
        'https://res.cloudinary.com/dmm1ewnt6/image/upload/v1757690261/1077063_sjwpkg.png';
    }
  }
  next();
});

// Ensure virtual fields are serialized
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

export default mongoose.model('User', UserSchema);
