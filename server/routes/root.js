export default async function (fastify, opts) {
  fastify.get('/', async function (req, res) {
    res.send('Привет от Хекслета!')
  })
}
