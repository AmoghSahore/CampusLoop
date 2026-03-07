import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// ─────────────────────────────────────────────────────────────
// CLOUDINARY CONFIGURATION
// ─────────────────────────────────────────────────────────────
// Reads Cloudinary credentials from environment variables and
// initializes the SDK. All upload operations will use this config.

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─────────────────────────────────────────────────────────────
// HELPER: Upload buffer or file path to Cloudinary
// ─────────────────────────────────────────────────────────────
// Accepts either:
//   - file.path (when multer saves to disk)
//   - file.buffer (when multer uses memoryStorage)
// Returns the secure_url or throws an error

export const uploadToCloudinary = async (file, folder = 'campusloop') => {
  try {
    // Validate environment configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      throw new Error('Cloudinary credentials not configured. Check .env file.');
    }

    // Upload using buffer or path
    const uploadOptions = {
      folder,
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good' },
      ],
    };

    let result;
    if (file.buffer) {
      // Upload from memory buffer (memoryStorage)
      result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });
    } else if (file.path) {
      // Upload from disk path (diskStorage)
      result = await cloudinary.uploader.upload(file.path, uploadOptions);
    } else {
      throw new Error('File must have either buffer or path property');
    }

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
  }
};

// ─────────────────────────────────────────────────────────────
// HELPER: Delete image from Cloudinary
// ─────────────────────────────────────────────────────────────
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete from Cloudinary: ${error.message}`);
  }
};

export default cloudinary;
