export default async function (fastify, opts) {
  fastify.get('/', async function (req, rep) {
    return rep.view('index')
  })
}