import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Pusher from 'pusher';

let pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_APP_KEY,
    secret: process.env.PUSHER_APP_SECRET,
    cluster: process.env.PUSHER_APP_CLUSTER,
});

export default pool => {
    let channel = Router();

    channel.post('/ready', function(req, res, next) {
        const channelName = req.body.channel;

        const selectChannelQuery = `SELECT * FROM 
                tweng_channels tc,
                tweng_users tu 
            WHERE tc.channel_id = tu.channel_id 
            AND tc.channel = $1`;
        pool
            .query(selectChannelQuery, [channelName])
            .then(data => {
                const activePlayersInChannel = data.rows.length;
                const players = data.rows.map(row => ({
                    userId: row.user_id,
                    username: row.username,
                }));

                let responseJson = {
                    type: 'ready',
                    valid: false,
                    activePlayersInChannel: activePlayersInChannel,
                    players: players,
                };

                if (activePlayersInChannel === 2) {
                    responseJson.valid = true;
                    responseJson.startingPlayerId =
                        players[Math.round(Math.random() - 1) + 1].userId;
                }

                pusher.trigger(channelName, 'tweng', responseJson);
                res.sendStatus(200);
            })
            .catch(e => {
                console.error('Error', e);
                res.sendStatus(400);
            });
    });

    channel.post('/message', function(req, res, next) {
        const channelName = req.body.channel;
        pusher.trigger(channelName, 'tweng', req.body);
        res.sendStatus(200);
    });

    channel.post('/join', (req, res, next) => {
        const channelName = req.body.channel;
        const username = req.body.username;

        const selectChannelQuery = `SELECT tc.channel_id FROM 
                tweng_channels tc,
                tweng_users tu 
            WHERE tc.channel_id = tu.channel_id 
            AND tc.channel = $1`;
        pool
            .query(selectChannelQuery, [channelName])
            .then(data => {
                const activePlayersInChannel = data.rows.length;
                const isValid = activePlayersInChannel === 1 ? true : false;
                const channelId =
                    data.rows.length > 0 ? data.rows[0].channel_id : null;

                let responseJson = {
                    valid: isValid,
                };

                if (activePlayersInChannel === 0) {
                    responseJson.message = "Channel doesn't exist.";
                }

                if (activePlayersInChannel >= 2) {
                    responseJson.message = 'Channel already full.';
                }

                if (isValid) {
                    const insertUserQuery = `INSERT INTO tweng_users (channel_id, username) 
                        VALUES ($1, $2) RETURNING user_id`;
                    pool
                        .query(insertUserQuery, [channelId, username])
                        .then(data => {
                            responseJson.userId = data.rows[0].user_id;
                            res.json(responseJson);
                        })
                        .catch(e => {
                            console.error('Error', e);
                            res.sendStatus(400);
                        });
                } else {
                    res.json(responseJson);
                }
            })
            .catch(e => {
                console.error('Error', e);
                res.sendStatus(400);
            });
    });

    channel.post('/create', (req, res, next) => {
        const username = req.body.username;
        const channelName = 'tweng-' + uuidv4();

        if (!username) {
            res.status(400).send('Username cannot be empty!');
            return;
        }

        const insertChannelQuery = `INSERT INTO tweng_channels (channel, created) 
                VALUES ($1, now()) RETURNING channel_id`;
        const insertUserQuery = `INSERT INTO tweng_users (channel_id, username) 
                VALUES ($1, $2) RETURNING user_id`;
        pool
            .query(insertChannelQuery, [channelName])
            .then(data => {
                pool
                    .query(insertUserQuery, [data.rows[0].channel_id, username])
                    .then(data => {
                        res.json({
                            channel: channelName,
                            userId: data.rows[0].user_id,
                        });
                    })
                    .catch(e => {
                        console.error('Error', e);
                        res.sendStatus(400);
                    });
            })
            .catch(e => {
                console.error('Error', e);
                res.sendStatus(400);
            });
    });

    return channel;
};
