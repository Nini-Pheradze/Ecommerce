const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        text: {
            type: String,
            required: [true, 'Message text is required'],
            trim: true,
        },
    },
    { timestamps: true }
);

const supportTicketSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        subject: {
            type: String,
            required: [true, 'Subject is required'],
            trim: true,
        },
        status: {
            type: String,
            enum: ['open', 'closed'],
            default: 'open',
        },
        messages: [messageSchema],
    },
    { timestamps: true }
);

supportTicketSchema.index({ user: 1 });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
