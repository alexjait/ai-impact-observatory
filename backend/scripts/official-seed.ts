import { existsSync } from 'fs';
import { resolve } from 'path';

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

import { env } from '../src/shared/env';
import {
  resetAndRunOfficialSeedImport,
  resetSeedDomain,
  runOfficialSeedImport,
} from '../src/modules/admin/seed-import.core';

const envPath = resolve(__dirname, '..', '.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const prisma = new PrismaClient();
const command = (process.argv[2] ?? 'reload').trim().toLowerCase();

async function main() {
  if (!['reset', 'import', 'reload'].includes(command)) {
    throw new Error(`Unsupported seed command "${command}". Use reset, import, or reload.`);
  }

  if (command === 'reset') {
    await resetSeedDomain(prisma);
    console.log(`Seed domain cleared using ${env.seedCsvPath}.`);
    return;
  }

  if (command === 'import') {
    const run = await runOfficialSeedImport(prisma, env.seedCsvPath);
    console.log(
      `Seed import completed. Run=${run.id} processed=${run.processedRows} rejected=${run.rejectedRows} warnings=${run.warningCount}.`,
    );
    return;
  }

  const run = await resetAndRunOfficialSeedImport(prisma, env.seedCsvPath);
  console.log(
    `Seed reload completed. Run=${run.id} processed=${run.processedRows} rejected=${run.rejectedRows} warnings=${run.warningCount}.`,
  );
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
