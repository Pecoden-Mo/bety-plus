import userModel from '../models/userModel.js';
import companyModel from '../models/companyModel.js';
import workerModel from '../models/workerModel.js';

// Middleware to get current images before update (for users)
export const getCurrentUserImage = async (req, res, next) => {
  try {
    if (req.method === 'PATCH' && req.user && req.user.id) {
      const user = await userModel.findById(req.user.id).select('image');
      if (user && user.image) {
        req.currentUserImage = user.image;
      }
    }
    next();
  } catch (error) {
    console.error('Error getting current user image:', error);
    next();
  }
};

// Middleware to get current company images before update
export const getCurrentCompanyImage = async (req, res, next) => {
  try {
    if (req.method === 'PATCH' && req.user && req.user.id) {
      const company = await companyModel
        .findOne({ user: req.user.id })
        .select('commercialLicensePhoto');
      if (company && company.commercialLicensePhoto) {
        req.currentCompanyImage = company.commercialLicensePhoto;
      }
    }
    next();
  } catch (error) {
    console.error('Error getting current company image:', error);
    next();
  }
};

// Middleware to get current worker images before update
export const getCurrentWorkerImages = async (req, res, next) => {
  try {
    if (req.method === 'PATCH' && req.params.id) {
      const worker = await workerModel
        .findById(req.params.id)
        .select('pictureWorker introductoryVideo');
      if (worker) {
        req.currentWorkerImages = {
          pictureWorker: worker.pictureWorker,
          introductoryVideo: worker.introductoryVideo,
        };
      }
    }
    next();
  } catch (error) {
    console.error('Error getting current worker images:', error);
    next();
  }
};

// Generic middleware to handle entity deletion and cleanup images
export const cleanupImagesOnDelete = (Model, imageFields) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json;

    // Get the document before deletion for cleanup
    if (req.method === 'DELETE' && req.params.id) {
      try {
        const doc = await Model.findById(req.params.id).select(
          imageFields.join(' ')
        );
        req.documentToCleanup = doc;
      } catch (error) {
        console.error('Error getting document for cleanup:', error);
      }
    }

    // Override json method to cleanup after successful deletion
    res.json = async function (data) {
      if (data && data.status === 'success' && req.documentToCleanup) {
        try {
          const { deleteFromCloudinary } = await import(
            '../utils/uploadHelper.js'
          );

          for (const field of imageFields) {
            const imageUrl = req.documentToCleanup[field];
            if (imageUrl) {
              const deleteResult = await deleteFromCloudinary(imageUrl);
              console.log(`Cleanup - ${field} deletion result:`, deleteResult);
            }
          }
        } catch (error) {
          console.error('Error during image cleanup:', error);
        }
      }

      return originalJson.call(this, data);
    };

    next();
  };
};
