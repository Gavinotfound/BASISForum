import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgres://basis_user:basis_password@localhost:5432/basis_forum',
  },
});
