import {
  Box,
  Cog,
  Database,
  FlaskConical,
  Folder,
  Play,
  Route,
  Workflow,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

/*
 * What part a file plays, worked out from its path — the same answer every
 * time, no model involved. Each role gets a UML-ish shape and an icon so the
 * type reads without relying on colour; colour only reinforces it.
 *
 * ponytail: path rules, Python naming conventions only. Content-based roles
 * (a file defining ORM models, a FastAPI router) when the parser's symbols
 * are saved.
 */
export type Role =
  | 'entry'
  | 'route'
  | 'data'
  | 'service'
  | 'config'
  | 'util'
  | 'package'
  | 'test'
  | 'module'

export type Shape = 'pill' | 'cylinder' | 'folder' | 'dashed' | 'box'

export const ROLES: Record<
  Role,
  { label: string; icon: LucideIcon; shape: Shape; colour: string }
> = {
  entry: {
    label: 'Entry point',
    icon: Play,
    shape: 'pill',
    colour: 'var(--color-role-entry)',
  },
  route: {
    label: 'API / routes',
    icon: Route,
    shape: 'box',
    colour: 'var(--color-role-route)',
  },
  data: {
    label: 'Data / models',
    icon: Database,
    shape: 'cylinder',
    colour: 'var(--color-role-data)',
  },
  service: {
    label: 'Logic / services',
    icon: Workflow,
    shape: 'box',
    colour: 'var(--color-role-service)',
  },
  config: {
    label: 'Config',
    icon: Cog,
    shape: 'dashed',
    colour: 'var(--color-role-config)',
  },
  util: {
    label: 'Utilities',
    icon: Wrench,
    shape: 'box',
    colour: 'var(--color-role-util)',
  },
  package: {
    label: 'Package',
    icon: Folder,
    shape: 'folder',
    colour: 'var(--color-role-package)',
  },
  module: {
    label: 'Module',
    icon: Box,
    shape: 'box',
    colour: 'var(--color-role-module)',
  },
  test: {
    label: 'Tests & examples',
    icon: FlaskConical,
    shape: 'dashed',
    colour: 'var(--color-role-test)',
  },
}

/** Legend order: roughly top of the graph to the bottom. */
export const ROLE_ORDER: Role[] = [
  'entry',
  'route',
  'service',
  'data',
  'config',
  'util',
  'package',
  'module',
  'test',
]

const ENTRY_FILES = new Set([
  '__main__.py',
  'main.py',
  'cli.py',
  'app.py',
  'manage.py',
  'wsgi.py',
  'asgi.py',
])
const CONFIG_FILES = new Set([
  'config.py',
  'settings.py',
  'constants.py',
  'conf.py',
  'configuration.py',
  'env.py',
])
const DATA_DIRS = [
  'models',
  'db',
  'database',
  'schemas',
  'schema',
  'migrations',
  'repositories',
  'entities',
  'orm',
]
const DATA_FILES = new Set([
  'models.py',
  'schema.py',
  'schemas.py',
  'db.py',
  'database.py',
  'tables.py',
])
const ROUTE_DIRS = [
  'routes',
  'api',
  'views',
  'endpoints',
  'controllers',
  'handlers',
  'routers',
]
const ROUTE_FILES = new Set([
  'views.py',
  'routes.py',
  'urls.py',
  'api.py',
  'endpoints.py',
  'router.py',
])
const SERVICE_DIRS = [
  'services',
  'service',
  'workers',
  'tasks',
  'jobs',
  'modules',
]
const UTIL_DIRS = ['utils', 'util', 'helpers', 'lib', 'common', 'shared']
const UTIL_FILES = new Set([
  'utils.py',
  'util.py',
  'helpers.py',
  'compat.py',
  '_compat.py',
  'tools.py',
])

export function roleOf(path: string): Role {
  const parts = path.toLowerCase().split('/')
  const file = parts[parts.length - 1]
  const dirs = parts.slice(0, -1)
  const inDir = (names: string[]) => dirs.some((d) => names.includes(d))

  if (
    // Examples, docs and benchmarks import the code like tests do: useful,
    // but not where a newcomer reads the code itself.
    inDir([
      'tests',
      'test',
      'testing',
      'examples',
      'example',
      'docs',
      'benchmarks',
    ]) ||
    file.startsWith('test_') ||
    file.endsWith('_test.py') ||
    file === 'conftest.py'
  ) {
    return 'test'
  }
  if (ENTRY_FILES.has(file)) return 'entry'
  if (file === '__init__.py') return 'package'
  if (CONFIG_FILES.has(file) || inDir(['config', 'settings'])) return 'config'
  if (DATA_FILES.has(file) || inDir(DATA_DIRS)) return 'data'
  if (ROUTE_FILES.has(file) || inDir(ROUTE_DIRS)) return 'route'
  if (file.endsWith('service.py') || inDir(SERVICE_DIRS)) return 'service'
  if (UTIL_FILES.has(file) || inDir(UTIL_DIRS)) return 'util'
  return 'module'
}
