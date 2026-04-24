import mongoose, { Schema, Document } from 'mongoose';

export interface ICharacter extends Document {
    name: string;
    species: string;
    kingdom: string;
    isHero: boolean;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const characterSchema = new Schema<ICharacter>({
    name: {
        type: String,
        required: [true, 'Ім\'я є обов\'язковим'],
        trim: true,
        minlength: [1, 'Ім\'я має містити хоча б 1 символ'],
        maxlength: [100, 'Ім\'я не може перевищувати 100 символів'],
        validate: {
            validator: function(v: string) {
                return !/\d/.test(v);
            },
            message: 'Ім\'я персонажа не може містити цифри'
        }
    },
    species: {
        type: String,
        required: [true, 'Вид є обов\'язковим'],
        trim: true
    },
    kingdom: {
        type: String,
        required: [true, 'Королівство є обов\'язковим'],
        trim: true
    },
    isHero: {
        type: Boolean,
        required: true,
        default: false
    },
    description: {
        type: String,
        maxlength: [500, 'опис не може перевищувати 500 символів']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

characterSchema.virtual('summary').get(function() {
    const role = this.isHero ? 'Герой' : 'Звичайний житель';
    return `${this.name} — ${role} виду ${this.species} з території ${this.kingdom}.`;
});

export const CharacterModel = mongoose.model<ICharacter>('Character', characterSchema);