import { CharacterModel } from '../models/character.model';
import { CreateCharacterInput, UpdateCharacterInput } from '../schemas/character.schema';

interface GetAllParams {
    species?: string;
    kingdom?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
}

export const characterStorage = {
    async getAll(params: GetAllParams) {
        const { species, kingdom, sortBy = 'createdAt', page = 1, limit = 10 } = params;

        const query: Record<string, any> = {};

        if (species) {
            query.species = { $regex: new RegExp(species, 'i') };
        }
        if (kingdom) {
            query.kingdom = { $regex: new RegExp(kingdom, 'i') };
        }

        const sortDirection = sortBy.startsWith('-') ? -1 : 1;
        const sortField = sortBy.startsWith('-') ? sortBy.substring(1) : sortBy;
        const sortOption = { [sortField]: sortDirection };

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            CharacterModel.find(query).sort(sortOption as any).skip(skip).limit(limit),
            CharacterModel.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        };
    },

    async getHeroes() {
        return await CharacterModel.find({ isHero: true });
    },

    async getById(id: string) {
        return await CharacterModel.findById(id);
    },

    async create(data: CreateCharacterInput) {
        return await CharacterModel.create(data);
    },

    async update(id: string, data: UpdateCharacterInput) {
        return await CharacterModel.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true
        });
    },

    async delete(id: string): Promise<boolean> {
        const deletedCharacter = await CharacterModel.findByIdAndDelete(id);
        return deletedCharacter !== null;
    }
};