import { register } from "module"

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})

module.exports = withPWA({
  // next.js config
  // Explicitly set an (empty) turbopack config so Next doesn't error
  // Note: do NOT set `output: 'export'` when using server-side features like API routes or Prisma.
  // The app requires a running Next server to support `/api/*` routes.
  turbopack: {},
})