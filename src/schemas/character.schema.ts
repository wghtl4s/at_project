import { z } from 'zod';

export const createCharacterSchema = z.object({
    name: z.string().min(1).max(100),
    species: z.string().min(1),
    kingdom: z.string().min(1),
    isHero: z.boolean(),
    description: z.string().max(500).optional(),
});

export const updateCharacterSchema = createCharacterSchema.partial();

export const characterSchema = createCharacterSchema.extend({
    id: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Character = z.infer<typeof characterSchema>;
export type CreateCharacterInput = z.infer<typeof createCharacterSchema>;
export type UpdateCharacterInput = z.infer<typeof updateCharacterSchema>;