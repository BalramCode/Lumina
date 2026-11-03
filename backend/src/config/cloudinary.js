const cloudinary = require("cloudinary").v2;
const env = require("./env");

if (env.cloudinary.isConfigured) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
}

function uploadStreamToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    if (!env.cloudinary.isConfigured) {
      const err = new Error("Cloudinary credentials are not configured in backend/.env.");
      err.code = "CLOUDINARY_NOT_CONFIGURED";
      return reject(err);
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "lumina/learning",
        ...options,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}

async function deleteCloudinaryAsset(publicId, resourceType = "video") {
  if (!publicId || !env.cloudinary.isConfigured) {
    return null;
  }

  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    // Avoid failing operation if Cloudinary asset deletion encounters an issue
    console.warn(`[Cloudinary] Asset deletion failed for ${publicId}:`, error.message);
    return null;
  }
}

module.exports = {
  cloudinary,
  uploadStreamToCloudinary,
  deleteCloudinaryAsset,
};
