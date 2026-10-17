import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from './logger.js';
import Service from '../models/Service.js';
dotenv.config();

// Temporary production / test dummy data array state
const sampleServices = [
  {
    title: 'AC Repair & Maintenance',
    description: 'Expert cooling services with 6 months warranty.',
    price: 3500,
    category: 'Home Appliances',
    providerId: new mongoose.Types.ObjectId(),
    slug: 'ac-repair-maintenance' // Unique slug for first service
  },
  {
    title: 'Professional Car Wash',
    description: 'Premium detailing and interior deep cleaning.',
    price: 1500,
    category: 'Automotive',
    providerId: new mongoose.Types.ObjectId(),
    slug: 'professional-car-wash' // Unique slug for second service
  }
];


const importData = async () => {
  try {
    // Pehle purana data saaf karte hain takay duplicates na hon
    await Service.deleteMany();
    logger.info('🗑️ Old data cleared successfully');

    // Naya structural data push karte hain
    await Service.insertMany(sampleServices);
    logger.info('🚀 Mock services seeded into Database successfully!');
    
    process.exit();
  } catch (error) {
    logger.error(`❌ Data insertion failed: ${error.message}`);
    process.exit(1);
  }
};

// Database connection layer execution
mongoose.connect(process.env.MONGO_URI)
  .then(() => importData());
