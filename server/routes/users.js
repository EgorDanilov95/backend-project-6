import i18next from 'i18next';

export default (app) => {
  app
    .get('/users', { name: 'users' }, async (req, reply) => {
      const users = await app.objection.models.user.query();
      return reply.render('users/index', { users, currentUser: req.user || null });
    })
    .get('/users/new', { name: 'newUser' }, (req, reply) => {
      const user = new app.objection.models.user();
      return reply.render('users/new', { user });
    })
    .post('/users', async (req, reply) => {
      const user = new app.objection.models.user();
      user.$set(req.body.data);
      try {
        const validUser = await app.objection.models.user.fromJson(req.body.data);
        await app.objection.models.user.query().insert(validUser);
        req.flash('info', i18next.t('flash.users.create.success'));
        return reply.redirect(app.reverse('root'));
      } catch (err) {
        req.flash('error', i18next.t('flash.users.create.error'));
        return reply.render('users/new', { user: req.body.data, errors: err.data || {} });
      }
    })
    .get('/users/:id/edit', { name: 'editUser', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const user = await app.objection.models.user.query().findById(id);
      if (!user) {
        return reply.status(404).send('User not found');
      }
      if (req.user.id !== user.id) {
        req.flash('error', i18next.t('flash.users.notAllowed'));
        return reply.redirect(app.reverse('users'));
      }
      return reply.render('users/edit', { user });
    })
    .patch('/users/:id', { name: 'updateUser', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const user = await app.objection.models.user.query().findById(id);
      if (!user) {
        return reply.status(404).send('User not found');
      }
      if (req.user.id !== user.id) {
        req.flash('error', i18next.t('flash.users.notAllowed'));
        return reply.redirect(app.reverse('users'));
      }
      const updateData = { ...req.body.data };
      if (!updateData.password) {
        delete updateData.password;
      }

      try {
        await user.$query().patch(updateData);
        req.flash('info', i18next.t('flash.users.update.success'));
        return reply.redirect(app.reverse('users'));
      } catch (err) {
        console.error(err);
        req.flash('error', i18next.t('flash.users.update.error'));
        const errors = err.data || {};
        const userWithId = { ...req.body.data, id };
        return reply.render('users/edit', { user: userWithId, errors });
      }
    })
    .delete('/users/:id', { name: 'deleteUser', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const user = await app.objection.models.user.query().findById(id);
      if (!user) {
        return reply.status(404).send('User not found');
      }
      if (req.user.id !== user.id) {
        req.flash('error', i18next.t('flash.users.notAllowed'));
        return reply.redirect(app.reverse('users'));
      }
      try {
        await user.$query().delete();
        req.logOut();
        req.flash('info', i18next.t('flash.users.delete.success'));
        return reply.redirect(app.reverse('root'));
      } catch (err) {
        console.error(err);
        req.flash('error', i18next.t('flash.users.delete.error'));
        return reply.redirect(app.reverse('users'));
      }
    });
};
