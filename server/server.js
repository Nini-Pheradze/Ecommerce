// Sentry ინსტრუმენტაცია (და .env-ის ჩატვირთვა) უნდა მოხდეს ყველაფერზე ადრე
const Sentry = require('./instrument');

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const globalErrorHandler = require('./middleware/errorMiddleware');
const orderController = require('./controllers/orderController');
const authRouter = require('./routes/authRoutes');
const productRouter = require('./routes/productRoutes');
const searchRouter = require('./routes/searchRoutes');
const cartRouter = require('./routes/cartRoutes');
const orderRouter = require('./routes/orderRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const couponRoutes = require('./routes/couponRoutes');
const adminRoutes = require('./routes/adminRoutes');
const supportRoutes = require('./routes/supportRoutes');

const app = express();

// Express 5-ში ნაგულისხმევი query parser შეიცვალა 'simple'-ზე, რომელსაც არ ესმის
// bracket notation (price[gte]=10) - 'extended'-ზე დაბრუნება აღადგენს ამ ქცევას
app.set('query parser', 'extended');

const passport = require('./config/passport');

// ბაზასთან დაკავშირება
connectDB();

// CORS - საშუალებას აძლევს ცალკე გაშვებულ Frontend-ს (Next.js) დაუკავშირდეს API-ს
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}));

// Stripe Webhook - raw body სჭირდება ხელმოწერის ვერიფიკაციისთვის, ამიტომ express.json()-მდეა
app.post('/api/orders/webhook', express.raw({ type: 'application/json' }), orderController.stripeWebhook);

// Middleware JSON ტანის (body) წასაკითხად
app.use(express.json());

// სტატიკური ფაილების საქაღალდის დაკავშირება (სურათების საჩვენებლად)
app.use('/public', express.static(path.join(__dirname, 'public')));

// სესიის კონფიგურაცია
app.use(session({
    secret: process.env.SESSION_SECRET || 'my_super_secret_key',
    resave: false,
    saveUninitialized: false
}));

// Passport-ის მიბმა
app.use(passport.initialize());
app.use(passport.session());

// როუტები
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/search', searchRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/categories', categoryRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);

// Sentry Error Handler - აფიქსირებს დაუჭერელ შეცდომებს Sentry-ში, სანამ ჩვენს handler-ს მიაღწევს
if (process.env.SENTRY_DSN) {
    Sentry.setupExpressErrorHandler(app);
}

// გლობალური Error Handling Middleware
app.use(globalErrorHandler);

// სერვერის გაშვება
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});