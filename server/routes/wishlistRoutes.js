const express = require('express');
const wishlistController = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ყველა მარშრუტი დაცულია (ავტორიზებული მომხმარებლისთვის)
router.use(protect);

// Wishlist-ის ნახვა
router.get('/', wishlistController.getWishlist);

// Wishlist-ში დამატება
router.post('/', wishlistController.addToWishlist);

// Wishlist-იდან ამოღება
router.delete('/:productId', wishlistController.removeFromWishlist);

module.exports = router;