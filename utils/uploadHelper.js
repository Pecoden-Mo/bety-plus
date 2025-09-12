import cloudinary from '../config/cloudinary.js';
import multer from 'multer';

// Multer setup for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
  const extname = allowedTypes.test(
    file.originalname.split('.').pop().toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images and videos are allowed!'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

// Upload to Cloudinary
export const uploadToCloudinary = (
  fileBuffer,
  folder,
  transformation = null
) => {
  return new Promise((resolve, reject) => {
    const resourceType = 'auto'; // Auto-detect image or video

    const uploadOptions = {
      resource_type: resourceType,
      folder,
      ...(transformation && { transformation }),
    };

    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      })
      .end(fileBuffer);
  });
};

// Delete from Cloudinary
export const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl || typeof imageUrl !== 'string') {
      return { success: false, message: 'Invalid image URL' };
    }

    // Skip deletion for default images
    const defaultImages = [
      'https://res.cloudinary.com/dmm1ewnt6/image/upload/v1757679007/companies/licenses/jt5rlumyfi8lj5xh9xwg.png',
      'https://res.cloudinary.com/dmm1ewnt6/image/upload/v1757690261/1077063_sjwpkg.png',
    ];

    if (
      defaultImages.some((defaultUrl) =>
        imageUrl.includes(defaultUrl.split('/').pop())
      )
    ) {
      return { success: true, message: 'Default image, skipping deletion' };
    }

    // Extract public_id from Cloudinary URL
    const publicId = extractPublicIdFromUrl(imageUrl);
    if (!publicId) {
      return {
        success: false,
        message: 'Could not extract public ID from URL',
      };
    }

    // Determine resource type (image or video)
    const resourceType = imageUrl.includes('/video/') ? 'video' : 'image';

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    return {
      success: result.result === 'ok',
      message:
        result.result === 'ok'
          ? 'Image deleted successfully'
          : 'Image not found or already deleted',
      result,
    };
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return { success: false, message: error.message };
  }
};

// Extract public_id from Cloudinary URL
export const extractPublicIdFromUrl = (url) => {
  try {
    if (!url || !url.includes('cloudinary.com')) {
      return null;
    }

    // Extract the public_id from URL
    // URL format: https://res.cloudinary.com/cloud_name/image/upload/v123456/folder/subfolder/filename.ext
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex((part) => part === 'upload');

    if (uploadIndex === -1) {
      return null;
    }

    // Get everything after version number (v123456)
    const pathAfterVersion = urlParts.slice(uploadIndex + 2).join('/');

    // Remove file extension
    const publicId = pathAfterVersion.replace(/\.[^/.]+$/, '');

    return publicId;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};
