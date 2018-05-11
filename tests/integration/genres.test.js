const request = require('supertest');
const {Genre} = require('../../models/genre');
const mongoose = require('mongoose');
const {User} = require('../../models/user');
let server;

describe('/api/genres', () => {
    beforeEach(async () => {
        server = await require('../../index');
    });
    afterEach(async () => {
        await Genre.remove({});
        await server.close();
    });

    describe('GET /', () => {
        it('should return all genres', async () => {
            await Genre.collection.insertMany([
                {name: 'genre1'},
                {name: 'genre2'},
                {name: 'genre3'}
            ]);

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

        it('should return 404 if no genre with given id exists', async () => {
            const id = mongoose.Types.ObjectId();
            const res = await request(server).get('/api/genres/' + id);

            expect(res.status).toBe(404);
        });
    });


    describe('POST /', () => {

        //Define happy Path
        let token;
        let name;

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'genre1';
        });

        const exec = async () => {

            return await request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({name});
        };

        it('should return 404 if client is not logged in', async () => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });


        it('should return 400 if genre is less that 5 characters', async () => {
            name = '1234';
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if genre is more than 50 characters', async () => {
            name = new Array(52).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should save the genre if is valid', async () => {
            await exec();

            const genre = await Genre.find({name: 'genre1'});

            expect(genre).not.toBeNull();
        });

        it('should return the genre if is valid', async () => {
            const res = await exec();

            const genre = await Genre.find({name: 'genre1'});

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name');
        });

    });
});