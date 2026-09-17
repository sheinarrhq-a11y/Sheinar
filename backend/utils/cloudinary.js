const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a buffer to Cloudinary under sheinar/products/
 * Returns { url, public_id }
 */
function uploadBuffer(buffer, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "sheinar/products", public_id: filename, resource_type: "image", format: "webp", transformation: [{ quality: "auto", fetch_format: "auto" }] },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

function deleteImage(public_id) {
  return cloudinary.uploader.destroy(public_id);
}

module.exports = { uploadBuffer, deleteImage };
