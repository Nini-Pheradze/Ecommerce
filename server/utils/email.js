const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // 1. შევქმნათ ტრანსპორტერი (მაგალითად Mailtrap ტესტებისთვის ან Gmail)
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });

    // 2. წერილის დეტალები
    const mailOptions = {
        from: 'ShopSpace <hello@shopspace.dev>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    // 3. გაგზავნა
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;