import fastify from 'fastify';
import init from '../server/plugin.js';
import { getTestData, prepareData } from './helpers/index.js';

describe('test statuses CRUD', () => {
  let app;
  let knex;
  let models;
  let cookies;
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

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/session',
      payload: {
        data: {
          email: testData.users.existing.email,
          password: testData.users.existing.password,
        },
      },
    });
    cookies = loginResponse.headers['set-cookie'];
  });

  const randomStatusName = () => `Status-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/statuses',
      headers: { cookie: cookies },
    });
    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/statuses/new',
      headers: { cookie: cookies },
    });
    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const newStatus = { name: randomStatusName() };
    const response = await app.inject({
      method: 'POST',
      url: '/statuses',
      headers: { cookie: cookies },
      payload: { data: newStatus },
    });
    expect(response.statusCode).toBe(302);
    const addedStatus = await models.taskStatus.query().findOne({ name: newStatus.name });
    expect(addedStatus).toMatchObject(newStatus);
  });

  it('update', async () => {
    const existingStatus = await models.taskStatus.query().first();
    const updatedName = randomStatusName();
    const response = await app.inject({
      method: 'PATCH',
      url: `/statuses/${existingStatus.id}`,
      headers: { cookie: cookies },
      payload: { data: { name: updatedName } },
    });
    expect(response.statusCode).toBe(302);
    const updatedStatus = await models.taskStatus.query().findById(existingStatus.id);
    expect(updatedStatus.name).toBe(updatedName);
  });

  it('delete without authentication should redirect', async () => {
    const existingStatus = await models.taskStatus.query().first();
    const response = await app.inject({
      method: 'DELETE',
      url: `/statuses/${existingStatus.id}`,

    });
    expect(response.statusCode).toBe(302);
    const statusAfter = await models.taskStatus.query().findById(existingStatus.id);
    expect(statusAfter).toBeTruthy();
  });

  it('delete with authentication should succeed', async () => {
    const existingStatus = await models.taskStatus.query().first();
    const response = await app.inject({
      method: 'DELETE',
      url: `/statuses/${existingStatus.id}`,
      headers: { cookie: cookies },
    });
    expect(response.statusCode).toBe(302);
    const deletedStatus = await models.taskStatus.query().findById(existingStatus.id);
    expect(deletedStatus).toBeFalsy();
  });

  afterAll(async () => {
    await app.close();
  });
});