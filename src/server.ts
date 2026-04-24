import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}
import app from './app';
import { connectDB } from './config/database';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 8080;

async function startServer() {
    try {
        await connectDB();

        const server = app.listen(PORT, () => {
            console.log(`сервер працює на порту ${PORT}`);
        });

        process.on('SIGTERM', () => {
            console.log('SIGTERM');
            server.close(async () => {
                await mongoose.connection.close();
                console.log('підкл закрито');
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('помлка бд', error);
        process.exit(1);
    }
}

startServer();