import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import characterRoutes from './routes/character.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();


app.get('/health', (_req, res) => {
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
        res.status(200).json({
            status: 'ok',
            db: 'connected',
        });
    } else {
        res.status(503).json({
            status: 'error',
            db: 'disconnected',
        });
    }
});


app.use(cors());
app.use(express.json());

app.use('/api/characters', characterRoutes);

app.use(errorHandler);

export default app;