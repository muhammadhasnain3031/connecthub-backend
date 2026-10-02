import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// 1. Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Cloudinary Storage Engine Setup
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'connecthub_uploads', // Cloudinary par is naam ka folder banega
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // File validation (Type check)
        transformation: [{ width: 500, height: 500, crop: 'limit' }] // Auto resizing
    }
});

// 3. File Size Limit Configuration
const limits = {
    fileSize: 2 * 1024 * 1024 // 2MB Max Limit (Security against heavy files)
};

// 4. Reusable Multer Middleware Instance
export const upload = multer({ storage: storage, limits: limits });
