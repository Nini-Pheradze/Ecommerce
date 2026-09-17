const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');

// 1. ყველა მომხმარებლის ნახვა (ადმინისთვის)
exports.getAllUsers = catchAsync(async (req, res) => {
    const users = await User.find();
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: { users }
    });
});

// 2. მომხმარებლის როლის შეცვლა (მაგ: user -> moderator -> admin)
exports.updateUserRole = catchAsync(async (req, res) => {
    const { role } = req.body;
    if (!['user', 'moderator', 'admin'].includes(role)) {
        return res.status(400).json({ status: 'fail', message: 'Invalid role specified' });
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true, runValidators: true }
    );

    if (!user) {
        return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    res.status(200).json({
        status: 'success',
        message: 'User role updated successfully',
        data: { user }
    });
});

// 3. მომხმარებლის დაბლოკვა / განბლოკვა
exports.toggleBlockUser = catchAsync(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
        status: 'success',
        message: `User successfully ${user.isBlocked ? 'blocked' : 'unblocked'}`,
        data: { user }
    });
});

// 4. მომხმარებლის წაშლა
exports.deleteUser = catchAsync(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
        return res.status(404).json({ status: 'fail', message: 'User not found' });
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
});

// 5. მომხმარებლისთვის გაფრთხილების (Warning) მიცემა
exports.warnUser = catchAsync(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    user.warningsCount += 1;
    await user.save();

    res.status(200).json({
        status: 'success',
        message: 'Warning issued to user',
        data: { user }
    });
});