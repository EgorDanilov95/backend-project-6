import i18next from 'i18next';

export default (app) => {
  app
    .get('/statuses', { name: 'statuses' }, async (req, reply) => {
      const statuses = await app.objection.models.taskStatus.query(); 
      return reply.render('statuses/index', { statuses, currentUser: req.user });
    })
    .get('/statuses/new', {name: 'newStatus', preValidation: app.authenticate}, async (req,reply) => {
      const status = new app.objection.models.taskStatus()
      return reply.render('statuses/new', {status})
    })
    .post('/statuses', {preValidation: app.authenticate}, async(req,reply) => {
      const status = new app.objection.models.taskStatus()
      status.$set(req.body.data)
      try {
        const validStatus = await app.objection.models.taskStatus.fromJson(req.body.data);
        await app.objection.models.taskStatus.query().insert(validStatus);
        req.flash('info', i18next.t('flash.statuses.create.success'));
        return reply.redirect(app.reverse('statuses'));
      } catch (err) {
        req.flash('error', i18next.t('flash.statuses.create.error'));
        return reply.render('statuses/new', { status: req.body.data, errors: err.data || {} });
      }
    })
    .get('/statuses/:id/edit', { name: 'editStatus', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const status = await app.objection.models.taskStatus.query().findById(id);
      if (!status) {
        return reply.status(404).send('Status not found');
      }
      return reply.render('statuses/edit', { status });
    })
    .patch('/statuses/:id', { name: 'updateStatus', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const status = await app.objection.models.taskStatus.query().findById(id);
      if (!status) {
        return reply.status(404).send('Status not found');
      }
      const updateData = { ...req.body.data };
      try {
        await status.$query().patch(updateData);
        req.flash('info', i18next.t('flash.statuses.update.success'));
        return reply.redirect(app.reverse('statuses'));
      } catch (err) {
        console.error(err);
        req.flash('error', i18next.t('flash.statuses.update.error'));
        const errors = err.data || {};
        const statusWithId = { ...req.body.data, id };
        return reply.render('statuses/edit', { status: statusWithId, errors });
      }
    })
    .delete('/statuses/:id', { name: 'deleteStatus', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const status = await app.objection.models.taskStatus.query().findById(id);
      const tasksWithStatus = await app.objection.models.task.query().where('statusId', id).resultSize()
      if (!status) {
        return reply.status(404).send('Status not found');
      }
      if (tasksWithStatus > 0) {
        req.flash('error', i18next.t('flash.statuses.delete.taskError'))
        return reply.redirect(app.reverse('statuses'));
      }
      try {
        await status.$query().delete();
        req.flash('success', i18next.t('flash.statuses.delete.success'));
        return reply.redirect(app.reverse('statuses'));
      } catch (err) {
        console.error(err);
        req.flash('error', i18next.t('flash.statuses.delete.error'));
        return reply.redirect(app.reverse('statuses'));
      }
    });
};
