Postgres + Prisma Setup

1) Install dependencies

npm install

2) Copy `.env.example` to `.env` and set `DATABASE_URL` to your Postgres connection string.

3) Initialize the database and run migrations

# generate prisma client
npx prisma generate

# create migration based on schema.prisma
npx prisma migrate dev --name init

4) Seed (optional) - you can create a small script to seed users

5) Start the app

npm run dev

Notes
- The Prisma schema lives at `prisma/schema.prisma`.
- Use the `lib/prisma` helper to access the Prisma client.
