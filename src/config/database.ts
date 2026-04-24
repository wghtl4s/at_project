import mongoose from 'mongoose';

export async function connectDB() {
    const uri = process.env.MONGO_URL;

    if (!uri) {
        console.error('MONGODB_URI is missing (check Fly secrets)');
        return;
    }

    await mongoose.connect(uri);
    console.log('підкл');
}

mongoose.connection.on('error', (err) => {
    console.error('помилка', err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('відключено');
});