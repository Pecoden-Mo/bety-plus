import mongoose from 'mongoose';

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

CompanySchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
};

export default mongoose.model('Company', CompanySchema);
