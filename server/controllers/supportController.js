const SupportTicket = require('../models/SupportTicket');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const isStaff = (role) => role === 'admin' || role === 'moderator';

// @desc    Create a new support ticket (opened by the current user)
// @route   POST /api/support
exports.createTicket = catchAsync(async (req, res, next) => {
    const { subject, message } = req.body;
    if (!subject || !message) {
        return next(new AppError('Subject and message are required', 400));
    }

    const ticket = await SupportTicket.create({
        user: req.user.id,
        subject,
        messages: [{ sender: req.user.id, text: message }],
    });

    res.status(201).json({ status: 'success', data: { ticket } });
});

// @desc    List tickets - staff (admin/moderator) see all, regular users see only their own
// @route   GET /api/support
exports.getTickets = catchAsync(async (req, res) => {
    const filter = isStaff(req.user.role) ? {} : { user: req.user.id };

    const tickets = await SupportTicket.find(filter)
        .populate('user', 'name email')
        .sort('-updatedAt');

    res.status(200).json({ status: 'success', results: tickets.length, data: { tickets } });
});

// @desc    Get a single ticket with its full message thread
// @route   GET /api/support/:id
exports.getTicket = catchAsync(async (req, res, next) => {
    const ticket = await SupportTicket.findById(req.params.id)
        .populate('user', 'name email')
        .populate('messages.sender', 'name role');

    if (!ticket) {
        return next(new AppError('Ticket not found', 404));
    }

    if (!isStaff(req.user.role) && ticket.user._id.toString() !== req.user.id) {
        return next(new AppError('You do not have permission to view this ticket', 403));
    }

    res.status(200).json({ status: 'success', data: { ticket } });
});

// @desc    Reply to a ticket - the owner or a moderator/admin can post a message
// @route   POST /api/support/:id/messages
exports.addMessage = catchAsync(async (req, res, next) => {
    const { text } = req.body;
    if (!text) {
        return next(new AppError('Message text is required', 400));
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
        return next(new AppError('Ticket not found', 404));
    }

    if (!isStaff(req.user.role) && ticket.user.toString() !== req.user.id) {
        return next(new AppError('You do not have permission to reply to this ticket', 403));
    }

    ticket.messages.push({ sender: req.user.id, text });
    // მომხმარებლის ახალი პასუხი ავტომატურად აღადგენს დახურულ ტიკეტს
    if (ticket.status === 'closed' && !isStaff(req.user.role)) {
        ticket.status = 'open';
    }
    await ticket.save();
    await ticket.populate('messages.sender', 'name role');
    await ticket.populate('user', 'name email');

    res.status(201).json({ status: 'success', data: { ticket } });
});

// @desc    Open/close a ticket - moderator/admin only
// @route   PATCH /api/support/:id/status
exports.updateStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;
    if (!['open', 'closed'].includes(status)) {
        return next(new AppError('Invalid status', 400));
    }

    const ticket = await SupportTicket.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!ticket) {
        return next(new AppError('Ticket not found', 404));
    }

    res.status(200).json({ status: 'success', data: { ticket } });
});
