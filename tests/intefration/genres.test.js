const request = require('supertest');
const {Genre} = require('../../models/genre');
let server;

describe('/api/genres', () => {
    beforeEach(async () => {
        server = require('../../index');
        await Genre.collection.insertMany([
            {name: 'genre1'},
            {name: 'genre2'},
            {name: 'genre3'}
        ]);
    });
    afterEach(async () => {
        await Genre.remove({});
        await server.close();
    });

    describe('GET /', () => {
        it('should return all genres', async () => {
            let res = await request(server).get('/api/genres');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(3);
        });
    });

    describe('GET /:id', () => {
        it('should return genre if valid idspassed', async () => {
            const genre = new Genre({name: 'genre1'});
            await genre.save();

            const res = await request(server).get('/api/genres/' + genre._id);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', genre.name);


        });
        it('should return 404 if invalid is passed', async () => {

            const res = await request(server).get('/api/genres/' + 1);

            expect(res.status).toBe(404);
        });
    });
});