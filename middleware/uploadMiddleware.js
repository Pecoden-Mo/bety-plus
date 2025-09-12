import {
  upload,
  uploadToCloudinary,
  deleteFromCloudinary,
} from '../utils/uploadHelper.js';

// Middleware for company registration with commercial license photo
export const companyRegistrationUpload = upload.fields([
  { name: 'commercialLicensePhoto', maxCount: 1 },
]);

export const processCompanyUpload = async (req, res, next) => {
  try {
    if (req.files && req.files.commercialLicensePhoto) {
      const file = req.files.commercialLicensePhoto[0];

      // Upload to cloudinary
      const imageUrl = await uploadToCloudinary(
        file.buffer,
        'companies/licenses',
        { width: 800, height: 600, crop: 'limit', quality: 'auto' }
      );

      // Store old image URL for deletion after successful update
      if (req.method === 'PATCH' && req.currentCompanyImage) {
        req.oldImageToDelete = req.currentCompanyImage;
      }

      // Add the URL to the request body
      req.body.commercialLicensePhoto = imageUrl;
    }

    next();
  } catch (error) {
    console.error('Company upload error:', error);
    return res.status(400).json({
      status: 'error',
      message: `Upload failed: ${error.message}`,
    });
  }
};

// Middleware for worker creation with image and video
export const workerCreationUpload = upload.fields([
  { name: 'pictureWorker', maxCount: 1 },
  { name: 'introductoryVideo', maxCount: 1 },
]);

export const processWorkerUploads = async (req, res, next) => {
  try {
    const uploadPromises = [];
    const oldImagesToDelete = {};

    // Handle worker picture
    if (req.files && req.files.pictureWorker) {
      const pictureFile = req.files.pictureWorker[0];

      // Store old image for deletion if this is an update
      if (req.method === 'PATCH' && req.currentWorkerImages) {
        oldImagesToDelete.pictureWorker = req.currentWorkerImages.pictureWorker;
      }

      uploadPromises.push(
        uploadToCloudinary(pictureFile.buffer, 'workers/photos', {
          width: 400,
          height: 400,
          crop: 'fill',
          quality: '90',
        }).then((url) => ({ field: 'pictureWorker', url }))
      );
    }

    // Handle introductory video
    if (req.files && req.files.introductoryVideo) {
      const videoFile = req.files.introductoryVideo[0];

      // Store old video for deletion if this is an update
      if (req.method === 'PATCH' && req.currentWorkerImages) {
        oldImagesToDelete.introductoryVideo =
          req.currentWorkerImages.introductoryVideo;
      }

      uploadPromises.push(
        uploadToCloudinary(videoFile.buffer, 'workers/videos', {
          width: 720,
          height: 480,
          crop: 'limit',
          quality: '90',
        }).then((url) => ({ field: 'introductoryVideo', url }))
      );
    }

    // Wait for all uploads to complete
    if (uploadPromises.length > 0) {
      const results = await Promise.all(uploadPromises);

      // Store old images for deletion after successful update
      req.oldImagesToDelete = oldImagesToDelete;

      // Add URLs to request body
      results.forEach(({ field, url }) => {
        req.body[field] = url;
      });
    }

    next();
  } catch (error) {
    console.error('Worker upload error:', error);
    return res.status(400).json({
      status: 'error',
      message: `Upload failed: ${error.message}`,
    });
  }
};

// Middleware for user profile picture upload
export const userProfileUpload = upload.single('profileImage');

export const processUserProfileUpload = async (req, res, next) => {
  try {
    if (req.file) {
      // Store old image for deletion if this is an update
      if (req.method === 'PATCH' && req.currentUserImage) {
        req.oldImageToDelete = req.currentUserImage;
      }

      const imageUrl = await uploadToCloudinary(
        req.file.buffer,
        'users/profiles',
        {
          width: 300,
          height: 300,
          crop: 'fill',
          gravity: 'face',
          quality: '90',
        }
      );

      req.body.profileImage = imageUrl;
      req.body.image = imageUrl; // Also set image field
    }

    next();
  } catch (error) {
    console.error('User profile upload error:', error);
    return res.status(400).json({
      status: 'error',
      message: `Upload failed: ${error.message}`,
    });
  }
};

// Middleware to delete old images after successful operations
export const deleteOldImages = async (req, res, next) => {
  // Store original json method
  const originalJson = res.json;

  // Override json method to delete old images after successful response
  res.json = async function (data) {
    // Only delete if operation was successful
    if (data && data.status === 'success') {
      try {
        // Delete single old image
        if (req.oldImageToDelete) {
          const deleteResult = await deleteFromCloudinary(req.oldImageToDelete);
          console.log('Old image deletion result:', deleteResult);
        }

        // Delete multiple old images (for workers)
        if (req.oldImagesToDelete) {
          for (const [field, imageUrl] of Object.entries(
            req.oldImagesToDelete
          )) {
            if (imageUrl) {
              const deleteResult = await deleteFromCloudinary(imageUrl);
              console.log(`Old ${field} deletion result:`, deleteResult);
            }
          }
        }
      } catch (error) {
        console.error('Error deleting old images:', error);
        // Don't fail the response due to deletion errors
      }
    }

    // Call original json method
    return originalJson.call(this, data);
  };

  next();
};
