import { v4 as uuidv4 } from 'uuid';
import arrayShuffle from 'array-shuffle';

// Attacking card types
const ATTACKING_CARD_TYPES = ['frontline', 'midrange', 'longrange'];

// Available strength per attacking card type
const FRONTLINE_STRENGTH = [1, 2, 4, 6, 8];
const MIDRANGE_STRENGTH = [1, 2, 4, 6, 8];
const LONGRANGE_STRENGTH = [1, 2, 4, 6, 8];

// Amount per attacking card type
const AMOUNT_CARDS_STRENGTH_1 = 2;
const AMOUNT_CARDS_STRENGTH_2 = 2;
const AMOUNT_CARDS_STRENGTH_4 = 2;
const AMOUNT_CARDS_STRENGTH_6 = 2;
const AMOUNT_CARDS_STRENGTH_8 = 2;

// Spell card types
const SPELL_CARD_TYPES = ['frost', 'fog', 'rain', 'clear'];

// Amount per spell card type
const AMOUNT_CARDS_FROST = 2;
const AMOUNT_CARDS_FOG = 2;
const AMOUNT_CARDS_RAIN = 2;
const AMOUNT_CARDS_CLEAR = 2;

const createCard = (id, type, strength, category) => {
    return {
        id,
        type,
        strength,
        category,
    };
};

const generateCards = () => {
    const cards = [];

    ATTACKING_CARD_TYPES.forEach(cardType => {
        const typeStength = eval(`${cardType.toUpperCase()}_STRENGTH`);
        typeStength.forEach(strength => {
            const amountOfCards = eval(`AMOUNT_CARDS_STRENGTH_${strength}`);
            for (let i = 0; i < amountOfCards; i++) {
                cards.push(createCard(uuidv4(), cardType, strength, 'attack'));
            }
        });
    });

    SPELL_CARD_TYPES.forEach(cardType => {
        const amountOfCards = eval(`AMOUNT_CARDS_${cardType.toUpperCase()}`);
        for (let i = 0; i < amountOfCards; i++) {
            cards.push(createCard(uuidv4(), cardType, 0, 'spell'));
        }
    });

    return cards;
};

const generateCardDeck = (amount = 20) => {
    return arrayShuffle(generateCards()).filter((_, i) => i < amount);
};

export { generateCardDeck };
