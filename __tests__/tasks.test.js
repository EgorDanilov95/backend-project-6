import fastify from 'fastify';
import init from '../server/plugin.js';
import { getTestData, prepareData } from './helpers/index.js';

describe('test tasks CRUD', () => {
  let app;
  let knex;
  let models;
  let cookiesUser1;
  let cookiesUser2;
  let user1Id;
  let user2Id;
  let testStatusId;
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

    const login1 = await app.inject({
      method: 'POST',
      url: '/session',
      payload: {
        data: {
          email: testData.users.existing.email,
          password: testData.users.existing.password,
        },
      },
    });
    cookiesUser1 = login1.headers['set-cookie'];
    const user1 = await models.user.query().findOne({ email: testData.users.existing.email });
    user1Id = user1.id;

    const newUserData = {
      firstName: 'Test',
      lastName: 'User',
      email: `testuser-${Date.now()}@example.com`,
      password: 'password123',
    };
    await app.inject({
      method: 'POST',
      url: '/users',
      payload: { data: newUserData },
    });
    const login2 = await app.inject({
      method: 'POST',
      url: '/session',
      payload: { data: { email: newUserData.email, password: newUserData.password } },
    });
    cookiesUser2 = login2.headers['set-cookie'];
    const user2 = await models.user.query().findOne({ email: newUserData.email });
    user2Id = user2.id;

    const statusData = { name: `TestStatus-${Date.now()}` };
    await app.inject({
      method: 'POST',
      url: '/statuses',
      headers: { cookie: cookiesUser1 },
      payload: { data: statusData },
    });
    const status = await models.taskStatus.query().findOne({ name: statusData.name });
    testStatusId = status.id;
  });

  const randomTaskData = () => ({
    name: `Task-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    description: 'Test description',
    statusId: testStatusId,
    executorId: user2Id, 
  });

  it('index', async () => {
    const response = await app.inject({ method: 'GET', url: '/tasks' });
    expect(response.statusCode).toBe(200);
  });

  it('new (authorized)', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/tasks/new',
      headers: { cookie: cookiesUser1 },
    });
    expect(response.statusCode).toBe(200);
  });

  it('new (unauthorized should redirect)', async () => {
    const response = await app.inject({ method: 'GET', url: '/tasks/new' });
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/session/new');
  });

  it('create', async () => {
    const taskData = randomTaskData();
    const response = await app.inject({
      method: 'POST',
      url: '/tasks',
      headers: { cookie: cookiesUser1 },
      payload: { data: taskData },
    });
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/tasks');

    const created = await models.task.query().findOne({ name: taskData.name });
    expect(created).toBeDefined();
    expect(created.name).toBe(taskData.name);
    expect(created.description).toBe(taskData.description);
    expect(created.statusId).toBe(taskData.statusId);
    expect(created.executorId).toBe(taskData.executorId);
    expect(created.creatorId).toBe(user1Id);
  });

  it('update', async () => {
    const taskData = randomTaskData();
    await app.inject({
      method: 'POST',
      url: '/tasks',
      headers: { cookie: cookiesUser1 },
      payload: { data: taskData },
    });
    const created = await models.task.query().findOne({ name: taskData.name });

    const updatedData = {
      name: `Updated-${Date.now()}`,
      description: 'Updated description',
      statusId: testStatusId,
      executorId: user1Id, 
    };
    const response = await app.inject({
      method: 'PATCH',
      url: `/tasks/${created.id}`,
      headers: { cookie: cookiesUser1 },
      payload: { data: updatedData },
    });
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/tasks');

    const updated = await models.task.query().findById(created.id);
    expect(updated.name).toBe(updatedData.name);
    expect(updated.description).toBe(updatedData.description);
    expect(updated.executorId).toBe(updatedData.executorId);
  });

  it('delete without authentication should redirect', async () => {
    const taskData = randomTaskData();
    await app.inject({
      method: 'POST',
      url: '/tasks',
      headers: { cookie: cookiesUser1 },
      payload: { data: taskData },
    });
    const created = await models.task.query().findOne({ name: taskData.name });

    const response = await app.inject({
      method: 'DELETE',
      url: `/tasks/${created.id}`,
    });
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/session/new');

    const taskAfter = await models.task.query().findById(created.id);
    expect(taskAfter).toBeDefined();
  });

  it('delete with authentication (creator) should succeed', async () => {
    const taskData = randomTaskData();
    await app.inject({
      method: 'POST',
      url: '/tasks',
      headers: { cookie: cookiesUser1 },
      payload: { data: taskData },
    });
    const created = await models.task.query().findOne({ name: taskData.name });

    const response = await app.inject({
      method: 'DELETE',
      url: `/tasks/${created.id}`,
      headers: { cookie: cookiesUser1 },
    });
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/tasks');

    const deleted = await models.task.query().findById(created.id);
    expect(deleted).toBeUndefined();
  });

  it('delete by another user should be forbidden', async () => {
    const taskData = randomTaskData();
    await app.inject({
      method: 'POST',
      url: '/tasks',
      headers: { cookie: cookiesUser1 },
      payload: { data: taskData },
    });
    const created = await models.task.query().findOne({ name: taskData.name });

    const response = await app.inject({
      method: 'DELETE',
      url: `/tasks/${created.id}`,
      headers: { cookie: cookiesUser2 },
    });
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/tasks');

    const taskAfter = await models.task.query().findById(created.id);
    expect(taskAfter).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });
});