import mongoose from 'mongoose';

export async function connectDB() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error('МОНГОДБ не знайдено у файлі .env');
        process.exit(1);
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