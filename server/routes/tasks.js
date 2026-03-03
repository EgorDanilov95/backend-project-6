import i18next from 'i18next';

export default (app) => {
  app
    .get('/tasks', { name: 'tasks' }, async (req, reply) => {
      const tasks = await app.objection.models.task.query().withGraphJoined('[status, creator, executor]');
      console.log('First task (raw):', tasks[0]);
      return reply.render('tasks/index', { tasks, currentUser: req.user });
    })
    .get('/tasks/new', { name: 'newTask', preValidation: app.authenticate }, async (req,reply) => {
      const task = new app.objection.models.task();
      const statuses = await app.objection.models.taskStatus.query();
      const users = await app.objection.models.user.query();
      const usersWithName = users.map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
      }));
      const emptyOption = { id: '', name: i18next.t('views.tasks.new.noExecutor') };
      const usersForSelect = [emptyOption, ...usersWithName];
      return reply.render('tasks/new', { task, statuses, users: usersForSelect });
    })
    .post('/tasks', {preValidation: app.authenticate}, async(req,reply) => {
      const dataTask = req.body.data;
      dataTask.creatorId = req.user.id;
      if (dataTask.executorId === '') {
        dataTask.executorId = null;
      }
      const task = new app.objection.models.task();
      task.$set(dataTask);
      try {
        await task.$query().insert();
        req.flash('info', i18next.t('flash.tasks.create.success'));
        return reply.redirect(app.reverse('tasks'));
      } catch (err) {
        console.error(err)
        req.flash('error', i18next.t('flash.tasks.create.error'));
        const statuses = await app.objection.models.taskStatus.query();
        const users = await app.objection.models.user.query();
        const usersWithName = users.map(user => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
        }));
        const emptyOption = { id: '', name: i18next.t('views.tasks.new.noExecutor') };
        const usersForSelect = [emptyOption, ...usersWithName];
        return reply.render('tasks/new', {
          task: dataTask,
          statuses,
          users: usersForSelect,
          errors: err.data || {},
        });
      }
    })
    .get('/tasks/:id/edit', { name: 'editTask', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const task = await app.objection.models.task.query().findById(id);
      if (!task) {
        return reply.status(404).send('Task not found');
      }
      const statuses = await app.objection.models.taskStatus.query();
      const users = await app.objection.models.user.query();
      const usersWithName = users.map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
      }));
      const emptyOption = { id: '', name: i18next.t('views.tasks.new.noExecutor') };
      const usersForSelect = [emptyOption, ...usersWithName];
      return reply.render('tasks/edit', {
        task,
        statuses,
        users: usersForSelect,
        errors: {},
      });
    })
    .patch('/tasks/:id', { name: 'updateTask', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const task = await app.objection.models.task.query().findById(id);
      if (!task) {
        return reply.status(404).send('Task not found');
      }
      const updateData = { ...req.body.data };
      if (updateData.executorId === '') {
        updateData.executorId = null;
      }
      if (updateData.statusId !== undefined && updateData.statusId !== '') {
        updateData.statusId = Number(updateData.statusId);
      }
      if (updateData.executorId !== undefined && updateData.executorId !== '' && updateData.executorId !== null) {
        updateData.executorId = Number(updateData.executorId);
      }
      try {
        await task.$query().patch(updateData);
        req.flash('info', i18next.t('flash.tasks.update.success'));
        return reply.redirect(app.reverse('tasks'));
      } catch (err) {
        req.flash('error', i18next.t('flash.tasks.update.error'));
        const statuses = await app.objection.models.taskStatus.query();
        const users = await app.objection.models.user.query();
        const usersWithName = users.map(user => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
        }));
        const emptyOption = { id: '', name: i18next.t('views.tasks.new.noExecutor') };
        const usersForSelect = [emptyOption, ...usersWithName];
        const errors = err.data || {};
        const taskWithId = { ...req.body.data, id };
        return reply.render('tasks/edit', {
          task: taskWithId,
          statuses,
          users: usersForSelect,
          errors,
        });
      }
    })
};