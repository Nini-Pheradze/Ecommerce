const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // 1. შევქმნათ ტრანსპორტერი (მაგალითად Mailtrap ტესტებისთვის ან Gmail)
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    // 2. წერილის დეტალები
    const mailOptions = {
        from: 'E-commerce Support <hello@ecommerce.io>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: options.html (სურვილისამებრ)
    };

    // 3. გაგზავნა
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;