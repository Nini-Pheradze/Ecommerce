// ეს ფაილი უნდა იყოს პირველი, რაც იტვირთება - Sentry-ის ავტომატურ ინსტრუმენტაციას
// სჭირდება, რომ express და სხვა მოდულები მისი Sentry.init()-ის შემდეგ დაიტვირთოს.
const dotenv = require('dotenv');
dotenv.config();

const Sentry = require('@sentry/node');

if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        tracesSampleRate: 1.0,
        environment: process.env.NODE_ENV || 'development',
    });
}

module.exports = Sentry;
