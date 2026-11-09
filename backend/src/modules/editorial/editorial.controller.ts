import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { EditorialStatus, RoleKey } from '@prisma/client';

import { CurrentUser } from '../../shared/current-user.decorator';
import type { AuthenticatedUser } from '../../shared/auth.types';
import { Roles } from '../../shared/roles.decorator';
import { RolesGuard } from '../../shared/roles.guard';
import { SessionAuthGuard } from '../../shared/session-auth.guard';
import { EditorialActivitiesQueryDto } from './dto/editorial-activities-query.dto';
import { EditorialActivityUpsertDto } from './dto/editorial-activity-upsert.dto';
import { EditorialCatalogActivitiesQueryDto } from './dto/editorial-catalog-activities-query.dto';
import { EditorialCatalogEvidenceQueryDto } from './dto/editorial-catalog-evidence-query.dto';
import { EditorialActivitySourceDto } from './dto/editorial-activity-source.dto';
import { EditorialBulkStatusDto } from './dto/editorial-bulk-status.dto';
import { EditorialEntityStatusDto } from './dto/editorial-entity-status.dto';
import { EditorialActivityStatusDto } from './dto/editorial-activity-status.dto';
import { EditorialActivitySummaryDto } from './dto/editorial-activity-summary.dto';
import { EditorialEvidenceUpsertDto } from './dto/editorial-evidence-upsert.dto';
import { MarkEvidenceReliabilityDto } from './dto/mark-evidence-reliability.dto';
import { EditorialService } from './editorial.service';

@Controller('editorial')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(RoleKey.EDITOR, RoleKey.ADMIN)
export class EditorialController {
  constructor(private readonly editorialService: EditorialService) {}

  @Get('activities')
  listActivities(@Query() query: EditorialActivitiesQueryDto) {
    return this.editorialService.listActivities(query);
  }

  @Get('catalog/references')
  getCatalogReferences(@Query('locale') locale?: 'en' | 'es') {
    return this.editorialService.getCatalogReferences(locale);
  }

  @Get('catalog/activities')
  listCatalogActivities(@Query() query: EditorialCatalogActivitiesQueryDto) {
    return this.editorialService.listCatalogActivities(query);
  }

  @Get('catalog/activities/:id')
  getCatalogActivity(@Param('id') id: string, @Query('locale') locale?: 'en' | 'es') {
    return this.editorialService.getCatalogActivity(id, locale);
  }

  @Post('catalog/activities')
  createCatalogActivity(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: EditorialActivityUpsertDto,
  ) {
    return this.editorialService.createCatalogActivity(user.id, dto);
  }

  @Patch('catalog/activities/:id')
  updateCatalogActivity(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: EditorialActivityUpsertDto,
  ) {
    return this.editorialService.updateCatalogActivity(user.id, id, dto);
  }

  @Post('catalog/activities/:id/status')
  updateCatalogActivityEditorialStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: EditorialEntityStatusDto,
  ) {
    return this.editorialService.updateCatalogActivityEditorialStatus(user.id, id, dto);
  }

  @Get('catalog/evidence')
  listCatalogEvidence(@Query() query: EditorialCatalogEvidenceQueryDto) {
    return this.editorialService.listCatalogEvidence(query);
  }

  @Get('catalog/evidence/:id')
  getCatalogEvidence(@Param('id') id: string, @Query('locale') locale?: 'en' | 'es') {
    return this.editorialService.getCatalogEvidence(id, locale);
  }

  @Post('catalog/evidence')
  createCatalogEvidence(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: EditorialEvidenceUpsertDto,
  ) {
    return this.editorialService.createCatalogEvidence(user.id, dto);
  }

  @Patch('catalog/evidence/:id')
  updateCatalogEvidence(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: EditorialEvidenceUpsertDto,
  ) {
    return this.editorialService.updateCatalogEvidence(user.id, id, dto);
  }

  @Post('catalog/evidence/:id/status')
  updateCatalogEvidenceEditorialStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: EditorialEntityStatusDto,
  ) {
    return this.editorialService.updateCatalogEvidenceEditorialStatus(user.id, id, dto);
  }

  @Post('activities/bulk-status')
  bulkUpdateActivityStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: EditorialBulkStatusDto,
  ) {
    return this.editorialService.bulkUpdateActivityStatus(user.id, dto);
  }

  @Get('activities/:id')
  getActivity(
    @Param('id') id: string,
    @Query('locale') locale?: 'en' | 'es',
    @Query('status') status?: EditorialStatus,
  ) {
    return this.editorialService.getActivityDetail(id, locale, status);
  }

  @Post('activities/:id/status')
  updateActivityStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: EditorialActivityStatusDto,
  ) {
    return this.editorialService.updateActivityStatus(user.id, id, dto);
  }

  @Patch('activities/:id/summary')
  updateActivitySummary(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: EditorialActivitySummaryDto,
  ) {
    return this.editorialService.updateActivitySummary(user.id, id, dto);
  }

  @Patch('activities/:id/source')
  updateActivitySource(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: EditorialActivitySourceDto,
  ) {
    return this.editorialService.updateActivitySource(user.id, id, dto);
  }

  @Post('evidence/:id/mark-reliability')
  markEvidenceReliability(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: MarkEvidenceReliabilityDto,
  ) {
    return this.editorialService.markEvidenceReliability(user.id, id, dto);
  }
}
