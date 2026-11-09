const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { PrismaClient, RoleKey } = require('@prisma/client');

const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const prisma = new PrismaClient();

async function main() {
  const [, , email, ...rawRoles] = process.argv;

  if (!email || rawRoles.length === 0) {
    throw new Error('Usage: node scripts/grant-user-roles.js <email> <ROLE...>');
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error(`User not found: ${email}`);
  }

  const roleKeys = rawRoles.map((role) => role.toUpperCase());
  const unknownRoles = roleKeys.filter((role) => !Object.values(RoleKey).includes(role));

  if (unknownRoles.length > 0) {
    throw new Error(`Unknown roles: ${unknownRoles.join(', ')}`);
  }

  const roles = await prisma.role.findMany({
    where: {
      key: {
        in: roleKeys,
      },
    },
  });

  for (const role of roles) {
    await prisma.userRoleAssignment.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: role.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: role.id,
      },
    });
  }

  const assigned = await prisma.userRoleAssignment.findMany({
    where: { userId: user.id },
    include: { role: true },
  });

  console.log(
    JSON.stringify(
      {
        userId: user.id,
        email,
        roles: assigned.map((item) => item.role.key),
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
