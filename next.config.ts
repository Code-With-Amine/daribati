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
  // Set output: 'export' to prepare a static export (generates an `out/` folder when running `next export`).
  // Note: static export requires that pages/components don't rely on server-only features.
  turbopack: {},
  output: 'export',
})