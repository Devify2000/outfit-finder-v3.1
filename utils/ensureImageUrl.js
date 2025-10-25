import cloudinary from "../config/cloudinary.js";

export async function ensureImageUrlFromBody(body) {
  const { imageUrl, base64Image } = body || {};
  if (imageUrl) return imageUrl;

  if (base64Image) {
    const uploaded = await cloudinary.uploader.upload(base64Image, {
      folder: "outfit-finder",
      resource_type: "image",
    });
    return uploaded.secure_url;
  }

  throw new Error("Missing imageUrl or base64Image");
}
