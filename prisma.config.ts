import { defineConfig } from '@prisma/client'

export default defineConfig({
  adapter: {
    type: 'pg',
    connectionString: process.env.DATABASE_URL,
  },
})
