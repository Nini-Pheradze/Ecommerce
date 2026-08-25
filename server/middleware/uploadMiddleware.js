const multer = require('multer');
const AppError = require('../utils/appError');

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img'); // დარწმუნდი, რომ public/img ფოლდერი არსებობს
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `product-${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`);
    }
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // მაქსიმუმ 5MB
});

// ვამზადებთ მიდლუერს, რომელიც მიიღებს 1 მთავარ ფოტოს (imageCover) და რამდენიმე დამატებითს (images)
exports.uploadProductImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 5 }
]);