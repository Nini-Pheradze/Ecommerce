const twilio = require('twilio');
dotenv = require('dotenv');
dotenv.config();

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

exports.sendSMS = async (toPhone, message) => {
    try {
        const response = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: toPhone
        });
        return { success: true, sid: response.sid };
    } catch (error) {
        console.error('Twilio Error:', error);
        return { success: false, error: error.message };
    }
};