const express = require('express');
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ყველა კალათის როუტი მოითხოვს ავტორიზაციას
router.use(protect);

// კალათის ნახვა და პროდუქტის დამატება
router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);

// პროდუქტის წაშლა კალათიდან ID-ის მიხედვით
router.delete('/:productId', cartController.removeFromCart);

module.exports = router;