import { Router } from 'express';

import { generateCardDeck } from '../utils';

export default () => {
    let cards = Router();

    cards.get('/', function(req, res, next) {
        const cards = generateCardDeck();
        res.json({ cards: cards });
    });

    return cards;
};
