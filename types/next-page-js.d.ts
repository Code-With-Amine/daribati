declare module "*app/*/page.js" {
  import type React from 'react'
  const Component: React.ComponentType<any>
  export default Component
}

declare module "*app/*/layout.js" {
  import type React from 'react'
  const Component: React.ComponentType<any>
  export default Component
}

declare module "*app/*/route.js" {
  const handler: any
  export = handler
}

// Support relative paths emitted by Next's validator (e.g. "../../app/notaire/dashboard/page.js")
declare module "../../app/**/page.js" {
  import type React from 'react'
  const Component: React.ComponentType<any>
  export default Component
}

declare module "../../app/**/layout.js" {
  import type React from 'react'
  const Component: React.ComponentType<any>
  export default Component
}

declare module "../../app/**/route.js" {
  const handler: any
  export = handler
}

// Explicit declarations for Next validator relative imports (editor may request exact strings)
declare module "../../app/notaire/dashboard/page.js" {
  import type React from 'react'
  const Component: React.ComponentType<any>
  export default Component
}
