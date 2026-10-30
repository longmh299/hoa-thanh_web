Fix Prisma for Next.js + Neon

1) .env
   Example:
     DATABASE_URL="postgresql://USER:PASS@ep-bold-grass-a1xox7cr.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
   NOTE: Use the DIRECT endpoint (no "-pooler") and remove "channel_binding=require".

2) Install fresh & generate
   rm -rf node_modules .next .turbo
   npm install
   npx prisma generate

3) Migrate DB (if needed)
   npx prisma migrate dev --name init

4) Run
   npm run dev    # If Turbopack acts up, try: npm run dev -- --no-turbo

Package changes:
- prisma + @prisma/client pinned to 5.22.0
- added postinstall: "prisma generate"
