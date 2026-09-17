const cloudinary = require('cloudinary').v2;

// Cloudinary კონფიგურირდება მხოლოდ იმ შემთხვევაში, თუ environment variables მითითებულია.
// წინააღმდეგ შემთხვევაში uploadMiddleware ლოკალურ დისკზე ატვირთვას გამოიყენებს (dev fallback).
exports.isCloudinaryConfigured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (exports.isCloudinaryConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}

exports.cloudinary = cloudinary;
