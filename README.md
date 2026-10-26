# InstaLite

Express + Prisma 7 + PostgreSQL.

## Setup
1. `npm install`
2. `cp .env.example .env` and put your own Postgres URL in `DATABASE_URL`
3. `npx prisma migrate dev --name init`   (creates all tables)
4. `npx prisma generate`
5. `npm run seed`
6. `npm start`  -> "Server started on port 3000"

Re-run `npm run seed` any time you want fresh data.
