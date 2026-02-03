import path from 'node:path'
import AutoLoad from '@fastify/autoload'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const options = {}

export default async function (fastify, opts) {
  // Place here your custom code!

  // This loads all plugins defined in plugins
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts),
    forceESM: true  // ← КРИТИЧЕСКИ ВАЖНО для ES-модулей
  })

  // This loads all plugins defined in routes
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts),
    forceESM: true  // ← КРИТИЧЕСКИ ВАЖНО для ES-модулей
  })
}