import { Injectable, NotFoundException } from '@nestjs/common';

import { env } from '../../shared/env';
import { PrismaService } from '../../prisma/prisma.service';
import {
  resetAndRunOfficialSeedImport,
  resetSeedDomain,
  runOfficialSeedImport,
} from './seed-import.core';

@Injectable()
export class SeedImportsService {
  constructor(private readonly prisma: PrismaService) {}

  runOfficialSeedImport() {
    return runOfficialSeedImport(this.prisma, env.seedCsvPath);
  }

  async resetSeedDomain() {
    await resetSeedDomain(this.prisma);
    return {
      ok: true,
      sourcePath: env.seedCsvPath,
      message: 'Seed domain data was cleared successfully.',
    };
  }

  resetAndRunOfficialSeedImport() {
    return resetAndRunOfficialSeedImport(this.prisma, env.seedCsvPath);
  }

  async getRun(runId: string) {
    const run = await this.prisma.seedImportRun.findUnique({
      where: { id: runId },
      include: {
        items: {
          orderBy: { rowNumber: 'asc' },
        },
      },
    });

    if (!run) {
      throw new NotFoundException('Seed import run not found.');
    }

    return {
      id: run.id,
      status: run.status,
      processedRows: run.processedRows,
      rejectedRows: run.rejectedRows,
      warningCount: run.warningCount,
      warnings: run.items
        .filter((item) => item.warning)
        .map((item) => ({
          rowNumber: item.rowNumber,
          warning: item.warning,
        })),
      rejectedItems: run.items
        .filter((item) => item.error)
        .map((item) => ({
          rowNumber: item.rowNumber,
          sourceKey: item.sourceKey,
          error: item.error,
        })),
    };
  }
}
