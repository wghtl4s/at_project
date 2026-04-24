import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { connectTestDB, closeTestDB, clearTestDB } from './setup';
import { CharacterModel } from '../src/models/character.model';
import { characterStorage } from '../src/storage/character.storage';
beforeAll(async () => await connectTestDB());
afterEach(async () => await clearTestDB());
afterAll(async () => await closeTestDB());

describe('Character API Integration Tests', () => {

    describe('POST /api/characters', () => {
        it('повинен створити персонажа і повернути 201', async () => {
            const res = await request(app)
                .post('/api/characters')
                .send({ name: 'Marceline', species: 'Vampire', kingdom: 'Nightosphere', isHero: false });

            expect(res.status).toBe(201);
            expect(res.body.name).toBe('Marceline');
        });

        it('повинен повернути 400 від Zod при невалідних даних (немає species)', async () => {
            const res = await request(app)
                .post('/api/characters')
                .send({ name: 'Ice King', kingdom: 'Ice Kingdom' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Помилка валідації вхідних даних');
        });
    });

    describe('GET /api/characters/:id', () => {
        it('повинен повернути персонажа за ID', async () => {
            const char = await CharacterModel.create({ name: 'BMO', species: 'Robot', kingdom: 'Ooo', isHero: true });

            const res = await request(app).get(`/api/characters/${char._id}`);
            expect(res.status).toBe(200);
            expect(res.body.name).toBe('BMO');
        });

        it('повинен повернути 404 для валідного, але неіснуючого Mongo ID', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app).get(`/api/characters/${fakeId}`);

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Character not found');
        });

        it('повинен повернути 400 для невалідного формату Mongo ID (CastError)', async () => {
            const res = await request(app).get('/api/characters/invalid-id-format');

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Невалідний формат ідентифікатора');
        });
    });

    describe('GET /api/characters (Pagination & Filters)', () => {
        beforeEach(async () => {
            await CharacterModel.create([
                { name: 'A', species: 'Human', kingdom: 'Ooo', isHero: true },
                { name: 'B', species: 'Dog', kingdom: 'Ooo', isHero: true },
                { name: 'C', species: 'Human', kingdom: 'Fire', isHero: false },
            ]);
        });

        it('повинен повернути відфільтровані дані з пагінацією', async () => {
            const res = await request(app).get('/api/characters?species=Human&limit=1&page=1');

            expect(res.status).toBe(200);
            expect(res.body.data.length).toBe(1);
            expect(res.body.pagination.total).toBe(2);
            expect(res.body.pagination.page).toBe(1);
        });
    });

    describe('DELETE /api/characters/:id', () => {
        it('повинен успішно видалити персонажа і повернути 204', async () => {
            const char = await CharacterModel.create({ name: 'Gunther', species: 'Penguin', kingdom: 'Ice', isHero: false });

            const res = await request(app).delete(`/api/characters/${char._id}`);
            expect(res.status).toBe(204);

            const check = await CharacterModel.findById(char._id);
            expect(check).toBeNull();
        });
    });

    describe('Перевірка блоків catch (Error Handling)', () => {
        it('повинен повертати 500 при непередбачуваній помилці бази даних', async () => {
            jest.spyOn(characterStorage, 'getAll').mockRejectedValueOnce(new Error('Штучний збій БД'));

            const res = await request(app).get('/api/characters');

            expect(res.status).toBe(500);
            expect(res.body.message).toBe('Внутрішня помилка сервера');

            jest.restoreAllMocks();
        });
    });
    describe('PATCH /api/characters/:id', () => {
        it('повинен успішно оновити персонажа', async () => {
            const char = await CharacterModel.create({
                name: 'Princess Bubblegum',
                species: 'Candy Elemental',
                kingdom: 'Candy',
                isHero: false
            });

            const res = await request(app)
                .patch(`/api/characters/${char._id}`)
                .send({ isHero: true });

            expect(res.status).toBe(200);
            expect(res.body.isHero).toBe(true);
        });

        it('повинен повернути 404 при оновленні неіснуючого персонажа', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .patch(`/api/characters/${fakeId}`)
                .send({ isHero: true });

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Character not found');
        });
    });

    describe('Перевірка помилок 404 та збоїв', () => {
        it('повинен повернути 404 при видаленні неіснуючого персонажа', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app).delete(`/api/characters/${fakeId}`);

            expect(res.status).toBe(404);
        });

        it('повинен ловити помилку бази даних у маршруті heroes', async () => {
            jest.spyOn(characterStorage, 'getHeroes').mockRejectedValueOnce(new Error('Збій БД'));
            const res = await request(app).get('/api/characters/heroes');

            expect(res.status).toBe(500);
            jest.restoreAllMocks();
        });
    });
});