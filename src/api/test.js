import { Router } from 'express';

export default () => {
    let testRoute = Router();

    testRoute.get('/', function(req, res, next) {
        res.send("It's working!");
    });

    return testRoute;
};
