// prisma/seed.js
// ---------------------------------------------------------------------------
// Seeds the database with a demo admin user.
// Run with: npm run seed
// ---------------------------------------------------------------------------

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log(' Starting database seed...');

  // Hash password for the seed user
  const hashedPassword = await bcrypt.hash('Admin@1234', 12);

  // Upsert — safe to run multiple times
  const user = await prisma.user.upsert({
    where: { email: 'admin@crimson.com' },
    update: {},
    create: {
      name: 'crimson',
      email: 'admin@crimson.com',
      password: hashedPassword,
    },
  });

  console.log(`✅ Seeded user: ${user.email} (id: ${user.id})`);
  console.log('   Password: Admin@1234');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
