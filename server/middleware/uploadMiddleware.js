const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const AppError = require('../utils/appError');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

// Production-ში სურათები Cloudinary-ში ინახება (persistent, CDN-ით მოწოდებული).
// თუ Cloudinary env variables არ არის მითითებული (მაგ. ლოკალურ დეველოპმენტში), ვუბრუნდებით
// ძველ ლოკალურ დისკზე შენახვის ლოგიკას public/img საქაღალდეში.
const storage = isCloudinaryConfigured
    ? new CloudinaryStorage({
        cloudinary,
        params: {
            folder: 'shopspace/products',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            transformation: [{ width: 1600, height: 1600, crop: 'limit' }],
        },
    })
    : multer.diskStorage({
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
    storage,
    fileFilter: multerFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // მაქსიმუმ 5MB
});

// ატვირთული ფაილიდან ვაბრუნებთ იმას, რაც Product მოდელში უნდა შეინახოს:
// Cloudinary-სთვის - სრული URL (file.path), ლოკალური disk-სთვის - მხოლოდ ფაილის სახელი.
exports.uploadedFileRef = (file) => (isCloudinaryConfigured ? file.path : file.filename);

// ვამზადებთ მიდლუერს, რომელიც მიიღებს 1 მთავარ ფოტოს (imageCover) და რამდენიმე დამატებითს (images)
exports.uploadProductImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 5 }
]);
