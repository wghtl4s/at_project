import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ZodError) {
        res.status(400).json({
            message: 'Помилка валідації вхідних даних',
            errors: err.issues
        });
        return;
    }

    if (err instanceof mongoose.Error.CastError) {
        res.status(400).json({
            message: 'Невалідний формат ідентифікатора'
        });
        return;
    }

    if (err instanceof mongoose.Error.ValidationError) {
        res.status(400).json({
            message: 'Помилка валідації бази даних',
            errors: err.errors
        });
        return;
    }

    if (err.code === 11000) {
        res.status(409).json({
            message: 'Запис вже існує'
        });
        return;
    }

    console.error('Неочікувана помилка сервера:', err);
    res.status(500).json({
        message: 'Внутрішня помилка сервера'
    });
};