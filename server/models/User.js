const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please tell us your name!'],
        },
        email: {
            type: String,
            required: [true, 'Please provide your email'],
            unique: true,
            lowercase: true,
        },
        role: {
            type: String,
            enum: ['user', 'moderator', 'admin'],
            default: 'user',
        },
        password: {
            type: String,
            required: [function() { return !this.googleId; }, 'Please provide a password'],
            minlength: 8,
            select: false,
        },
        wishlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
        ],
        // ვერიფიკაცია და უსაფრთხოება
        isVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: String,
        emailVerificationExpires: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        twoFactorEnabled: {
            type: Boolean,
            default: false
        },
        twoFactorSecret: String, 
        googleId: {
            type: String,
            unique: true,
            sparse: true
        },
        // 💡 დამატებულია ადმინის პანელისთვის საჭირო ველები:
        isBlocked: {
            type: Boolean,
            default: false
        },
        warningsCount: {
            type: Number,
            default: 0
        }
    }, { timestamps: true });

// პაროლის ჰეშირება შენახვამდე
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// პაროლის შედარების მეთოდი
userSchema.methods.comparePassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// პაროლის აღდგენის ტოკენის გენერაცია
userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 წუთი
    return resetToken;
};

module.exports = mongoose.model('User', userSchema);