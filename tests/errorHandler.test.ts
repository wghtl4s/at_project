import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { errorHandler } from '../src/middleware/errorHandler';

describe('Error Handler Middleware Unit Tests', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        nextFunction = jest.fn();
    });

    it('повинен обробляти mongoose.Error.ValidationError і повертати 400', () => {
        const error = new mongoose.Error.ValidationError(undefined);
        errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Помилка валідації бази даних'
        }));
    });

    it('повинен обробляти помилку дублювання Mongo (код 11000) і повертати 409', () => {
        const error = { code: 11000 };
        errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(409);
        expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Запис вже існує'
        }));
    });

    it('повинен обробляти непередбачувані помилки і повертати 500', () => {
        const error = new Error('Штучна помилка сервера');
        errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Внутрішня помилка сервера'
        }));
    });
});