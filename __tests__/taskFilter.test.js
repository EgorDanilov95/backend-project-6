import { load } from 'cheerio';
import fastify from 'fastify';
import init from '../server/plugin.js';
import { getTestData, prepareData } from './helpers/index.js';

describe('tasks filters', () => {
  let app;
  let models;
  let cookies;
  // eslint-disable-next-line max-len
  let status1; let status2; let user1Id; let user2Id; let label1; let label2; let task1; let task2; let
    task3;
  const testData = getTestData();

  beforeAll(async () => {
    app = fastify({
      exposeHeadRoutes: false,
      logger: { target: 'pino-pretty' },
    });
    await init(app);
    models = app.objection.models;

    await app.objection.knex.migrate.latest();
    await prepareData(app);
    const login = await app.inject({
      method: 'POST',
      url: '/session',
      // eslint-disable-next-line max-len
      payload: { data: { email: testData.users.existing.email, password: testData.users.existing.password } },
    });
    cookies = login.headers['set-cookie'];
    status1 = await models.taskStatus.query().first();
    if (!status1) {
      status1 = await models.taskStatus.query().insert({ name: 'Default status 1' });
    }

    status2 = await models.taskStatus.query().whereNot('id', status1.id).first();
    if (!status2) {
      status2 = await models.taskStatus.query().insert({ name: 'Default status 2' });
    }

    user1Id = (await models.user.query().findOne({ email: testData.users.existing.email })).id;
    const user2 = await models.user.query().insert({
      firstName: 'Test2',
      lastName: 'User2',
      email: `test2-${Date.now()}@example.com`,
      password: 'password123',
    });
    user2Id = user2.id;

    label1 = await models.label.query().insert({ name: 'Label 1' });
    label2 = await models.label.query().insert({ name: 'Label 2' });

    task1 = await models.task.query().insert({
      name: 'Task 1',
      statusId: status1.id,
      creatorId: user1Id,
      executorId: user1Id,
    });
    await task1.$relatedQuery('labels').relate(label1.id);

    task2 = await models.task.query().insert({
      name: 'Task 2',
      statusId: status1.id,
      creatorId: user2Id,
      executorId: user2Id,
    });
    await task2.$relatedQuery('labels').relate(label2.id);

    task3 = await models.task.query().insert({
      name: 'Task 3',
      statusId: status2.id,
      creatorId: user1Id,
      executorId: user2Id,
    });
    await task3.$relatedQuery('labels').relate(label1.id);
  });

  const ids = (res) => {
    const $ = load(res.body);
    return $('tbody tr').map((i, row) => Number($(row).find('td:first-child').text())).get();
  };

  it('filter by status', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/tasks?status=${status1.id}`,
      headers: { cookie: cookies },
    });
    expect(ids(res)).toEqual(expect.arrayContaining([task1.id, task2.id]));
  });

  it('filter by executor', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/tasks?executor=${user2Id}`,
      headers: { cookie: cookies },
    });
    expect(ids(res)).toEqual(expect.arrayContaining([task2.id, task3.id]));
  });

  it('filter by label', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/tasks?label=${label1.id}`,
      headers: { cookie: cookies },
    });
    expect(ids(res)).toEqual(expect.arrayContaining([task1.id, task3.id]));
  });

  it('filter by my tasks', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/tasks?isCreatorUser=true',
      headers: { cookie: cookies },
    });
    expect(ids(res)).toEqual(expect.arrayContaining([task1.id, task3.id]));
  });

  it('combined filter', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/tasks?status=${status1.id}&executor=${user2Id}`,
      headers: { cookie: cookies },
    });
    expect(ids(res)).toEqual([task2.id]);
  });

  it('no filters', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/tasks',
      headers: { cookie: cookies },
    });
    expect(ids(res)).toHaveLength(3);
  });

  afterAll(async () => {
    await app.close();
  });
});
