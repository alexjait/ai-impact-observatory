import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { RoleKey } from '@prisma/client';

import { CurrentUser } from '../../shared/current-user.decorator';
import type { AuthenticatedUser } from '../../shared/auth.types';
import { Roles } from '../../shared/roles.decorator';
import { RolesGuard } from '../../shared/roles.guard';
import { SessionAuthGuard } from '../../shared/session-auth.guard';
import { ModerationActionDto } from './dto/moderation-action.dto';
import { ModerationQueueQueryDto } from './dto/moderation-queue-query.dto';
import { ModerationService } from './moderation.service';

@Controller('moderation')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(RoleKey.MODERATOR, RoleKey.ADMIN)
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get('queue')
  getQueue(@Query() query: ModerationQueueQueryDto) {
    return this.moderationService.getQueue(query);
  }

  @Get('activities/:id')
  getActivityProposalDetail(@Param('id') id: string, @Query('locale') locale?: 'en' | 'es') {
    return this.moderationService.getActivityProposalDetail(id, locale);
  }

  @Get('evidence/:id')
  getEvidenceProposalDetail(@Param('id') id: string, @Query('locale') locale?: 'en' | 'es') {
    return this.moderationService.getEvidenceProposalDetail(id, locale);
  }

  @Post('activities/:id/approve')
  approveActivityProposal(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ModerationActionDto,
  ) {
    return this.moderationService.approveActivityProposal(user.id, id, dto);
  }

  @Post('activities/:id/reject')
  rejectActivityProposal(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ModerationActionDto,
  ) {
    return this.moderationService.rejectActivityProposal(user.id, id, dto);
  }

  @Post('activities/:id/request-correction')
  requestActivityProposalCorrection(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ModerationActionDto,
  ) {
    return this.moderationService.requestActivityProposalCorrection(user.id, id, dto);
  }

  @Post('evidence/:id/approve')
  approveEvidenceProposal(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ModerationActionDto,
  ) {
    return this.moderationService.approveEvidenceProposal(user.id, id, dto);
  }

  @Post('evidence/:id/reject')
  rejectEvidenceProposal(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ModerationActionDto,
  ) {
    return this.moderationService.rejectEvidenceProposal(user.id, id, dto);
  }

  @Post('evidence/:id/request-correction')
  requestEvidenceProposalCorrection(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ModerationActionDto,
  ) {
    return this.moderationService.requestEvidenceProposalCorrection(user.id, id, dto);
  }

  @Post('comments/:id/hide')
  hideComment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ModerationActionDto,
  ) {
    return this.moderationService.hideComment(user.id, id, dto);
  }

  @Post('comments/:id/archive')
  archiveComment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ModerationActionDto,
  ) {
    return this.moderationService.archiveComment(user.id, id, dto);
  }

  @Post('comments/:id/resolve-report')
  resolveCommentReport(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ModerationActionDto,
  ) {
    return this.moderationService.resolveCommentReport(user.id, id, dto);
  }
}
