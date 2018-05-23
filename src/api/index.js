import { Router } from 'express';

import test from './test';
import channel from './channel';
import cards from './cards';

export default pool => {
    let api = Router();

    // API endpoints
    api.use('/cards', cards());
    api.use('/channel', channel(pool));
    api.use('/test', test());

    return api;
};
