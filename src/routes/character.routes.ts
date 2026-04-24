import { Router, Request, Response, NextFunction } from 'express';
import { characterStorage } from '../storage/character.storage';
import { createCharacterSchema, updateCharacterSchema, CreateCharacterInput, UpdateCharacterInput } from '../schemas/character.schema';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/heroes', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const heroes = await characterStorage.getHeroes();
        res.status(200).json(heroes);
    } catch (error) {
        next(error);
    }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const species = req.query.species as string | undefined;
        const kingdom = req.query.kingdom as string | undefined;

        const sortBy = req.query.sort as string | undefined;

        const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

        const result = await characterStorage.getAll({ species, kingdom, sortBy, page, limit });
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
        const character = await characterStorage.getById(req.params.id);
        if (!character) {
            res.status(404).json({ message: 'Character not found' });
            return;
        }
        res.status(200).json(character);
    } catch (error) {
        next(error);
    }
});

router.post('/', validate(createCharacterSchema), async (req: Request<{}, {}, CreateCharacterInput>, res: Response, next: NextFunction) => {
    try {
        const character = await characterStorage.create(req.body);
        res.status(201).json(character);
    } catch (error) {
        next(error);
    }
});

router.patch('/:id', validate(updateCharacterSchema), async (req: Request<{ id: string }, {}, UpdateCharacterInput>, res: Response, next: NextFunction) => {
    try {
        const character = await characterStorage.update(req.params.id, req.body);
        if (!character) {
            res.status(404).json({ message: 'Character not found' });
            return;
        }
        res.status(200).json(character);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
        const success = await characterStorage.delete(req.params.id);
        if (!success) {
            res.status(404).json({ message: 'Character not found' });
            return;
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default router;