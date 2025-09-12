import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    commercialLicenseNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    commercialLicensePhoto: {
      type: String,
      trim: true,
      required: [true, 'Commercial license photo is required'],
    },
    licensingAuthority: {
      type: String,
      required: [true, 'Licensing authority is required'],
      trim: true,
    },
    headOfficeAddress: {
      type: String,
      required: [true, 'Head office address is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvalDate: {
      type: Date,
    },
  },
  { timestamps: true }
);
CompanySchema.virtual('workers', {
  ref: 'Worker',
  localField: '_id',
  foreignField: 'company',
  // count: true,
  // match:{ status: 'active' // Optional: filter workers by status}
});

export default mongoose.model('Company', CompanySchema);
