require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'me@me.me',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('adds a specific user\'s to-do item', async() => {

      const body = {
        todo: 'wash the fishes',
      };

      const expectation = {
        'id': 4,
        'todo': 'wash the fishes',
        'completed': false,
        'user_id': 2
      };

      const data = await fakeRequest(app)
        .post('/api/todos')
        .send(body)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
    
    test('updates a specific user\'s to-do item', async() => {

      const expectation = {
        'id': 4,
        'todo': 'wash the fishes',
        'completed': true,
        'user_id': 2
      };

      const data = await fakeRequest(app)
        .put('/api/todos/4')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns a specific user\'s to-do list', async() => {

      const expectation = [
        {
          'id': 4,
          'todo': 'wash the fishes',
          'completed': true,
          'user_id': 2
        }
      ];

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

  });
});
