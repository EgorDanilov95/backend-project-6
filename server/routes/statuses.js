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
  }
