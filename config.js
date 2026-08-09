// Public config. These values are safe to commit — the database is protected by
// Row Level Security (anyone may read, nobody may write) and every write goes
// through a Postgres function that checks the server passphrase.
export const SUPABASE_URL = 'https://lxbwfldeibjselogrszh.supabase.co'
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YndmbGRlaWJqc2Vsb2dyc3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzMDA2NTgsImV4cCI6MjEwMTg3NjY1OH0.jCbosLRY1baiKeSqavKLqVxFNQomqUztY0JjxsylDBk'

export const SERVER_NAME = 'THE ATLAS'

// Pin categories. Add your own freely — `key` is what gets stored in the
// database, so don't rename an existing key once people have used it.
export const KINDS = [
  { key: 'base',   label: 'Base',    color: '#7dd3fc', glyph: '⌂' },
  { key: 'place',  label: 'Place',   color: '#a3e635', glyph: '◆' },
  { key: 'farm',   label: 'Farm',    color: '#fbbf24', glyph: '✵' },
  { key: 'portal', label: 'Portal',  color: '#c084fc', glyph: '◎' },
  { key: 'shop',   label: 'Shop',    color: '#f472b6', glyph: '¤' },
  { key: 'grave',  label: 'Grave',   color: '#f87171', glyph: '†' },
  { key: 'event',  label: 'Event',   color: '#fb923c', glyph: '✦' },
  { key: 'danger', label: 'Danger',  color: '#ef4444', glyph: '⚠' },
]

export const DIMENSIONS = [
  { key: 'overworld', label: 'Overworld' },
  { key: 'nether',    label: 'Nether' },
  { key: 'end',       label: 'The End' },
]

// Background image layers, drawn under the grid.
//
// This is the upgrade path: when you render the world with PapyrusCS or
// unMined, drop the tiles in and list them here. Every pin is stored in world
// coordinates, so they will all land in exactly the right place with no rework.
//
//   { src: 'maps/spawn.png', dimension: 'overworld',
//     west: -1024, north: -1024, east: 1024, south: 1024 }
//
// west/north/east/south are the world X/Z coordinates of the image edges.
export const MAP_LAYERS = []
