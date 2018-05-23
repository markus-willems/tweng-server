import request from 'supertest';
import server from '../src/server';

afterEach(() => {
    server.close();
});

describe('suite for /test endpoint', () => {
    it("should return text 'It's working!'", async () => {
        const response = await request(server).get('/api/test');
        expect(response.text).toBe("It's working!");
    });
});

describe('suite for /channel endpoint', () => {
    it('should return a string containing `tweng-` for /create', async () => {
        const response = await request(server)
            .post('/api/channel/create')
            .send({ username: 'jimmy619' });
        expect(response.body.channel.includes('tweng-')).toBe(true);
    });

    it('should return a valid response for /join/:channel', async () => {
        const createChannelResponse = await request(server)
            .post('/api/channel/create')
            .send({ username: 'jimmy619' });
        const channelName = createChannelResponse.body.channel;
        const joinChannelResponse = await request(server)
            .post('/api/channel/join/')
            .send({
                channel: channelName,
                username: 'ray333',
            });
        expect(joinChannelResponse.body.valid).toBe(true);
    });

    it('should return an invalid response for /join/tweng-i-dont-exist', async () => {
        const response = await request(server)
            .post('/api/channel/join')
            .send({
                channel: 'tweng-i-dont-exist',
            });
        expect(response.body.valid).toBe(false);
    });
});
