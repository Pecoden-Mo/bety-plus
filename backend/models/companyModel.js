import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const CompanySchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    commercialLicenseNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    commercialLicensePhoto: {
      type: String,
      // required: true, // uncomment after setting up file upload
      trim: true,
    },
    licensingAuthority: {
      type: String,
      required: true,
      trim: true,
    },
    headOfficeAddress: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['company'],
      default: 'company',
    },
    active: {
      type: Boolean,
      default: false,
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

CompanySchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = bcrypt.hashSync(this.password, 10);
  next();
});

CompanySchema.methods.correctPassword = function (candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
};

CompanySchema.methods.generateResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  return token;
};
CompanySchema.methods.clearResetToken = function () {
  this.resetPasswordToken = null;
  this.resetPasswordExpires = null;
  this.resetPasswordAttempts = 0;
};
// Method to check if the password has been changed after a specific date
CompanySchema.methods.passwordChangedAfter = function (JWTTimestamp) {
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
export default mongoose.model('Company', CompanySchema);
