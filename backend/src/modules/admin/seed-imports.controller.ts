import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RoleKey } from '@prisma/client';

import { Roles } from '../../shared/roles.decorator';
import { RolesGuard } from '../../shared/roles.guard';
import { SessionAuthGuard } from '../../shared/session-auth.guard';
import { SeedImportsService } from './seed-imports.service';

@Controller('admin/seed-imports')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(RoleKey.ADMIN)
export class AdminSeedImportsController {
  constructor(private readonly seedImportsService: SeedImportsService) {}

  @Post()
  runImport() {
    return this.seedImportsService.runOfficialSeedImport();
  }

  @Post('reset')
  resetSeedDomain() {
    return this.seedImportsService.resetSeedDomain();
  }

  @Post('reset-and-run')
  resetAndRunImport() {
    return this.seedImportsService.resetAndRunOfficialSeedImport();
  }

  @Get(':runId')
  getRun(@Param('runId') runId: string) {
    return this.seedImportsService.getRun(runId);
  }
}
