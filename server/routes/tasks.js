import i18next from 'i18next';

export default (app) => {
  app
    .get('/tasks', { name: 'tasks' }, async (req, reply) => {
      const {
        status,
        executor,
        label,
        isCreatorUser,
      } = req.query;

      let query = app.objection.models.task.query().withGraphJoined('[status, creator, executor, labels]');

      if (status && status !== '') {
        query = query.where('statusId', status);
      }

      if (executor && executor !== '') {
        query = query.where('executorId', executor);
      }

      if (label && label !== '') {
        query = query.whereExists(
          app.objection.models.task.relatedQuery('labels').where('labels.id', label),
        );
      }

      if (isCreatorUser && req.user) {
        query = query.where('creatorId', req.user.id);
      }

      const tasks = await query;
      const statuses = await app.objection.models.taskStatus.query().orderBy('name');
      const users = await app.objection.models.user.query().orderBy('firstName');
      const labels = await app.objection.models.label.query().orderBy('name');

      const filterValues = {
        status: status || '',
        executor: executor || '',
        label: label || '',
        isCreatorUser: isCreatorUser === 'on' || isCreatorUser === 'true',
      };

      return reply.render('tasks/index', {
        tasks,
        currentUser: req.user,
        statuses,
        users: users.map((u) => ({ ...u, name: `${u.firstName} ${u.lastName}` })),
        labels,
        filters: filterValues,
      });
    })
    .get('/tasks/new', { name: 'newTask', preValidation: app.authenticate }, async (req, reply) => {
      const task = new app.objection.models.task();
      const statuses = await app.objection.models.taskStatus.query();
      const users = await app.objection.models.user.query();
      const usersWithName = users.map((user) => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
      }));
      const emptyOption = { id: '', name: i18next.t('views.tasks.new.noExecutor') };
      const usersForSelect = [emptyOption, ...usersWithName];
      const labels = await app.objection.models.label.query();
      return reply.render('tasks/new', {
        task, statuses, users: usersForSelect, labels,
      });
    })
    .post('/tasks', { preValidation: app.authenticate }, async (req, reply) => {
      const dataTask = req.body.data;
      dataTask.statusId = dataTask.statusId ? Number(dataTask.statusId) : null;
      if (dataTask.labels !== undefined && !Array.isArray(dataTask.labels)) {
        dataTask.labels = [dataTask.labels];
      }
      dataTask.creatorId = req.user.id;
      if (dataTask.executorId === '') {
        dataTask.executorId = null;
      }
      const task = new app.objection.models.task();
      task.$set(dataTask);
      try {
        await task.$query().insert();
        const labelIds = (req.body.data.labels || []).map((id) => Number(id));
        if (labelIds.length) {
          await Promise.all(labelIds.map((id) => task.$relatedQuery('labels').relate(id)));
        }
        req.flash('info', i18next.t('flash.tasks.create.success'));
        return reply.redirect(app.reverse('tasks'));
      } catch (err) {
        console.error(err);
        req.flash('error', i18next.t('flash.tasks.create.error'));
        const statuses = await app.objection.models.taskStatus.query();
        const labels = await app.objection.models.label.query();
        const users = await app.objection.models.user.query();
        if (dataTask.labels !== undefined && !Array.isArray(dataTask.labels)) {
          dataTask.labels = [dataTask.labels];
        }
        if (dataTask.labels) {
          dataTask.labels = dataTask.labels.map((id) => Number(id));
        }
        const usersWithName = users.map((user) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
        }));
        const emptyOption = { id: '', name: i18next.t('views.tasks.new.noExecutor') };
        const usersForSelect = [emptyOption, ...usersWithName];
        return reply.render('tasks/new', {
          task: new app.objection.models.task().$set(dataTask),
          statuses,
          labels,
          users: usersForSelect,
          errors: err.data || {},
        });
      }
    })
    .get('/tasks/:id', { name: 'taskShow', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const task = await app.objection.models.task.query().findById(id).withGraphJoined('[status, creator, executor, labels]');
      const labels = await app.objection.models.label.query();
      if (!task) {
        return reply.status(404).send('task not found');
      }
      return reply.render('tasks/show', { task, labels, currentUser: req.user });
    })

    .get('/tasks/:id/edit', { name: 'editTask', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const task = await app.objection.models.task.query().findById(id);
      if (!task) {
        return reply.status(404).send('Task not found');
      }
      const statuses = await app.objection.models.taskStatus.query();
      const users = await app.objection.models.user.query();
      const usersWithName = users.map((user) => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
      }));
      const emptyOption = { id: '', name: i18next.t('views.tasks.new.noExecutor') };
      const usersForSelect = [emptyOption, ...usersWithName];
      const labels = await app.objection.models.label.query();
      task.labels = (await task.$relatedQuery('labels')).map((label) => label.id);
      return reply.render('tasks/edit', {
        task,
        statuses,
        labels,
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
      if (updateData.labels !== undefined && !Array.isArray(updateData.labels)) {
        updateData.labels = [updateData.labels];
      }
      const labelIds = (updateData.labels || []).map((labelId) => Number(labelId));
      delete updateData.labels;
      if (updateData.executorId === '') {
        updateData.executorId = null;
      }
      if (updateData.statusId !== undefined && updateData.statusId !== '') {
        updateData.statusId = Number(updateData.statusId);
      }
      if (updateData.executorId !== undefined && updateData.executorId !== '' && updateData.executorId !== null) {
        updateData.executorId = Number(updateData.executorId);
      }
      const trx = await app.objection.models.task.startTransaction();
      try {
        await task.$query(trx).patch(updateData);
        await task.$relatedQuery('labels', trx).unrelate();
        if (labelIds.length) {
          await Promise.all(labelIds.map((labelId) => task.$relatedQuery('labels', trx).relate(labelId)));
        }
        await trx.commit();
        req.flash('success', i18next.t('flash.tasks.update.success'));
        return reply.redirect(app.reverse('tasks'));
      } catch (err) {
        await trx.rollback();
        console.error(err);
        req.flash('error', i18next.t('flash.tasks.update.error'));
        const labels = await app.objection.models.label.query();
        const statuses = await app.objection.models.taskStatus.query();
        const users = await app.objection.models.user.query();
        const usersWithName = users.map((user) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
        }));
        const emptyOption = { id: '', name: i18next.t('views.tasks.new.noExecutor') };
        const usersForSelect = [emptyOption, ...usersWithName];
        const errors = err.data || {};
        const taskWithId = { ...req.body.data, id };
        if (taskWithId.labels !== undefined && !Array.isArray(taskWithId.labels)) {
          taskWithId.labels = [taskWithId.labels];
        }
        if (taskWithId.labels) {
          taskWithId.labels = taskWithId.labels.map((labelId) => Number(labelId));
        }
        return reply.render('tasks/edit', {
          task: taskWithId,
          statuses,
          users: usersForSelect,
          errors,
          labels,
        });
      }
    })
    .delete('/tasks/:id', { name: 'deleteTask', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const task = await app.objection.models.task.query().findById(id);
      if (!task) {
        return reply.status(404).send('Task not found');
      }
      if (req.user.id !== task.creatorId) {
        req.flash('error', i18next.t('flash.tasks.delete.rootError'));
        return reply.redirect(app.reverse('tasks'));
      }
      try {
        await task.$query().delete();
        req.flash('success', i18next.t('flash.tasks.delete.success'));
        return reply.redirect(app.reverse('tasks'));
      } catch (err) {
        console.error(err);
        req.flash('error', i18next.t('flash.tasks.delete.error'));
        return reply.redirect(app.reverse('tasks'));
      }
    });
};
