# Buildana Cost Engine

Production-ready MVP estimation platform using Next.js App Router, Prisma, PostgreSQL, NextAuth credentials, Zod, React Hook Form, and React PDF.

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Default admin credentials:
- `admin@buildana.com.au`
- `Buildana123!`

## Routes
- `/login`
- `/dashboard`
- `/projects/new`
- `/projects/[id]`
- `/settings`
