
import { load } from 'cheerio';
import _ from 'lodash';
import fastify from 'fastify';

import init from '../server/plugin.js';
import encrypt from '../server/lib/secure.cjs';
import { getTestData, prepareData } from './helpers/index.js';

describe('test users CRUD', () => {
  let app;
  let knex;
  let models;
  const testData = getTestData();

  beforeAll(async () => {
    app = fastify({
      exposeHeadRoutes: false,
      logger: { target: 'pino-pretty' },
    });
    await init(app);
    knex = app.objection.knex;
    models = app.objection.models;

    await knex.migrate.latest();
    await prepareData(app);
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('users'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newUser'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.users.new;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('users'),
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(302);
    const expected = {
      ..._.omit(params, 'password'),
      passwordDigest: encrypt(params.password),
    };
    const user = await models.user.query().findOne({ email: params.email });
    expect(user).toMatchObject(expected);
  });

  describe('additional CRUD tests', () => {
    let testUser;
    let cookies;

    const login = async (email, password) => {
      const response = await app.inject({
        method: 'POST',
        url: '/session',
        payload: { data: { email, password } },
      });
      return response.headers['set-cookie'];
    };

    beforeEach(async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
      };
      await app.inject({
        method: 'POST',
        url: '/users',
        payload: { data: userData },
      });
      testUser = await models.user.query().findOne({ email: userData.email });
      cookies = await login(userData.email, userData.password);
    });

    it('GET /users/:id/edit returns edit page for own profile', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/users/${testUser.id}/edit`,
        headers: { cookie: cookies },
      });
      expect(response.statusCode).toBe(200);
      const $ = load(response.body);
      const firstNameInput = $('input[name="data[firstName]"]').val();
      expect(firstNameInput).toBe(testUser.firstName);
    });

    it('GET /users/:id/edit redirects to login if not authenticated', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/users/${testUser.id}/edit`,
      });
      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('/session/new');
    });

    it('GET /users/:id/edit forbids editing other user', async () => {
      const otherData = {
        firstName: 'Other',
        lastName: 'User',
        email: `other-${Date.now()}@example.com`,
        password: 'password456',
      };
      await app.inject({
        method: 'POST',
        url: '/users',
        payload: { data: otherData },
      });
      const otherUser = await models.user.query().findOne({ email: otherData.email });

      const response = await app.inject({
        method: 'GET',
        url: `/users/${otherUser.id}/edit`,
        headers: { cookie: cookies },
      });
      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('/users');
    });

    it('PATCH /users/:id updates own profile', async () => {
      const newFirstName = 'UpdatedName';
      const response = await app.inject({
        method: 'PATCH',
        url: `/users/${testUser.id}`,
        headers: { cookie: cookies },
        payload: { data: { firstName: newFirstName } },
      });
      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('/users');

      const updatedUser = await models.user.query().findById(testUser.id);
      expect(updatedUser.firstName).toBe(newFirstName);
    });

    it('PATCH /users/:id returns validation errors', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/users/${testUser.id}`,
        headers: { cookie: cookies },
        payload: { data: { firstName: '' } },
      });
      expect(response.statusCode).toBe(200);
      const $ = load(response.body);
      expect($('.invalid-feedback').length).toBeGreaterThan(0);
    });

    it('PATCH /users/:id forbids updating other user', async () => {
      const otherData = {
        firstName: 'Other',
        lastName: 'User',
        email: `other-${Date.now()}@example.com`,
        password: 'password456',
      };
      await app.inject({
        method: 'POST',
        url: '/users',
        payload: { data: otherData },
      });
      const otherUser = await models.user.query().findOne({ email: otherData.email });

      const response = await app.inject({
        method: 'PATCH',
        url: `/users/${otherUser.id}`,
        headers: { cookie: cookies },
        payload: { data: { firstName: 'Hack' } },
      });
      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('/users');

      const unchangedUser = await models.user.query().findById(otherUser.id);
      expect(unchangedUser.firstName).toBe(otherData.firstName);
    });

    it('DELETE /users/:id deletes own profile and logs out', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/users/${testUser.id}`,
        headers: { cookie: cookies },
      });
      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('/');

      const deletedUser = await models.user.query().findById(testUser.id);
      expect(deletedUser).toBeUndefined();

      const editPage = await app.inject({
  method: 'GET',
  url: `/users/${testUser.id}/edit`,
  headers: { cookie: cookies },
});
expect(editPage.statusCode).toBe(302);
expect(editPage.headers.location).toBe('/session/new');
    });

    it('DELETE /users/:id forbids deleting other user', async () => {
      const otherData = {
        firstName: 'Other',
        lastName: 'User',
        email: `other-${Date.now()}@example.com`,
        password: 'password456',
      };
      await app.inject({
        method: 'POST',
        url: '/users',
        payload: { data: otherData },
      });
      const otherUser = await models.user.query().findOne({ email: otherData.email });

      const response = await app.inject({
        method: 'DELETE',
        url: `/users/${otherUser.id}`,
        headers: { cookie: cookies },
      });
      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('/users');

      const stillThere = await models.user.query().findById(otherUser.id);
      expect(stillThere).toBeDefined();
    });
  });

  afterEach(async () => {
    // Пока не используется
  });

  afterAll(async () => {
    await app.close();
  });
});
