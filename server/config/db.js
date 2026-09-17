const mongoose = require('mongoose');

const RETRY_DELAY_MS = 8000;

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
        dbName: 'E-commerce'
        });
        console.log(`MongoDB Connected: ${conn.connection.host} | DB: ${conn.connection.name}`);
    } catch (error) {
        console.error(`MongoDB connection failed: ${error.message}`);
        console.error(`Retrying in ${RETRY_DELAY_MS / 1000}s... (server keeps running in the meantime)`);
        setTimeout(connectDB, RETRY_DELAY_MS);
    }
};

module.exports = connectDB;
