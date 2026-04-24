import { connectTestDB, closeTestDB, clearTestDB } from './setup';
import { CharacterModel } from '../src/models/character.model';


beforeAll(async () => await connectTestDB());
afterEach(async () => await clearTestDB());
afterAll(async () => await closeTestDB());

describe('Character Model Unit Tests', () => {

    it('повинен успішно створити валідного персонажа', async () => {
        const char = await CharacterModel.create({
            name: 'Finn',
            species: 'Human',
            kingdom: 'Ooo'
        });

        expect(char._id).toBeDefined();
        expect(char.name).toBe('Finn');
        expect(char.isHero).toBe(false);
        expect(char.createdAt).toBeDefined();
        expect(char.updatedAt).toBeDefined();
    });

    it('повинен видати помилку, якщо ім\'я містить цифри (кастомний валідатор)', async () => {
        let error: any;
        try {
            await CharacterModel.create({
                name: 'Finn123',
                species: 'Human',
                kingdom: 'Ooo'
            });
        } catch (err) {
            error = err;
        }

        expect(error).toBeDefined();
        expect(error.errors.name.message).toBe('Ім\'я персонажа не може містити цифри');
    });

    it('повинен генерувати віртуальну властивість summary', async () => {
        const char = await CharacterModel.create({
            name: 'Jake',
            species: 'Dog',
            kingdom: 'Ooo',
            isHero: true
        });

        const jsonChar = char.toJSON() as any;
        expect(jsonChar.summary).toBe('Jake — Герой виду Dog з території Ooo.');
    });
});