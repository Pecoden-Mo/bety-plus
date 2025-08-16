import mongoose from 'mongoose';

mongoose.set('autoIndex', false);
mongoose.set('autoCreate', false);
const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
    });

    console.log('Connected to Database');
  } catch (error) {
    console.log(`Error in connection ${error}`);
    process.exit(1);
  }
};

export default dbConnection;
