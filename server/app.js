import path from 'node:path'
import AutoLoad from '@fastify/autoload'
import { fileURLToPath } from 'node:url'
import pointOfView from '@fastify/view'
import fastifyStatic from '@fastify/static'
import pug from 'pug'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const options = {}

export default async function (fastify, opts) {
  fastify.register(pointOfView, {
    engine: {
      pug 
    },
    root: path.join(__dirname, 'views'), 
    viewExt: 'pug'
  })
  
  fastify.register(fastifyStatic, {
    root: path.join(__dirname, '../node_modules/bootstrap/dist'),
    prefix: '/assets/bootstrap/', 
    decorateReply: false 
  })

  // This loads all plugins defined in plugins
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts),
    forceESM: true  
  })

  // This loads all plugins defined in routes
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts),
    forceESM: true  
  })
}