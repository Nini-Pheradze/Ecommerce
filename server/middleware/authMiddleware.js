const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');

exports.protect = catchAsync(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ status: 'fail', message: 'You are not logged in' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
        return res.status(401).json({ status: 'fail', message: 'User no longer exists' });
    }

    if (currentUser.isBlocked) {
        return res.status(403).json({ status: 'fail', message: 'Your account has been blocked' });
    }

    req.user = currentUser;
    next();
});


exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
        return res.status(403).json({
            status: 'fail',
            message: 'You do not have permission to perform this action'
        });
        }
        next();
    };
};