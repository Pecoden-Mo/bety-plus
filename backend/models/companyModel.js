import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
      required: true,
      unique: true,
      trim: true,
    },
    commercialLicensePhoto: {
      type: String, // Storing a URL or path to the image
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
    city: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Company', CompanySchema);
