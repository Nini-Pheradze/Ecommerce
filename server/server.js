const express = require('express');
const dotenv = require('dotenv');
const session = require('express-session');
const path = require('path');
// const Sentry = require("@sentry/node"); // დროებით ვთიშავთ
const connectDB = require('./config/db');
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

// .env ფაილის ჩატვირთვა
dotenv.config();

const app = express();

/* 
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
*/

const passport = require('./config/passport');

// ბაზასთან დაკავშირება
connectDB();

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

/* 
// Sentry Error Handler
app.use(Sentry.Handlers.errorHandler());
*/

// გლობალური Error Handling Middleware
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    });
});

// სერვერის გაშვება
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});