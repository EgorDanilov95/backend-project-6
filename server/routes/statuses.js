import i18next from 'i18next';

export default (app) => {
  app
    .get('/statuses', { name: 'statuses' }, async (req, reply) => {
      console.log('AVAILABLE MODELS:', Object.keys(app.objection.models));
      const statuses = await app.objection.models.taskStatus.query(); 
      return reply.render('statuses/index', { statuses, currentUser: req.user });
    });
};
