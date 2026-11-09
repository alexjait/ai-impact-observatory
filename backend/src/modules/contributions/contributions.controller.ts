import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../shared/current-user.decorator';
import type { AuthenticatedUser } from '../../shared/auth.types';
import { SessionAuthGuard } from '../../shared/session-auth.guard';
import { CreateActivityProposalDto, UpdateActivityProposalDto } from './dto/activity-proposal.dto';
import { CreateCommentDto } from './dto/comment.dto';
import { CreateEvidenceProposalDto, UpdateEvidenceProposalDto } from './dto/evidence-proposal.dto';
import { ListProposalsQueryDto } from './dto/list-proposals-query.dto';
import { ReportCommentDto } from './dto/report-comment.dto';
import { ContributionsService } from './contributions.service';

@Controller()
@UseGuards(SessionAuthGuard)
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @Post('me/activity-proposals')
  createActivityProposal(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateActivityProposalDto,
  ) {
    return this.contributionsService.createActivityProposal(user.id, dto);
  }

  @Get('me/activity-proposals')
  listActivityProposals(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListProposalsQueryDto,
  ) {
    return this.contributionsService.listActivityProposals(user.id, query.locale);
  }

  @Get('me/activity-proposals/:id')
  getActivityProposal(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.contributionsService.getActivityProposalDetail(user.id, id);
  }

  @Patch('me/activity-proposals/:id')
  updateActivityProposal(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateActivityProposalDto,
  ) {
    return this.contributionsService.updateActivityProposal(user.id, id, dto);
  }

  @Post('me/evidence-proposals')
  createEvidenceProposal(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateEvidenceProposalDto,
  ) {
    return this.contributionsService.createEvidenceProposal(user.id, dto);
  }

  @Get('me/evidence-proposals')
  listEvidenceProposals(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListProposalsQueryDto,
  ) {
    return this.contributionsService.listEvidenceProposals(user.id, query.locale);
  }

  @Get('me/evidence-proposals/:id')
  getEvidenceProposal(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.contributionsService.getEvidenceProposalDetail(user.id, id);
  }

  @Patch('me/evidence-proposals/:id')
  updateEvidenceProposal(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateEvidenceProposalDto,
  ) {
    return this.contributionsService.updateEvidenceProposal(user.id, id, dto);
  }

  @Get('me/followed-activities')
  listFollowedActivities(
    @CurrentUser() user: AuthenticatedUser,
    @Query('locale') locale?: 'en' | 'es',
  ) {
    return this.contributionsService.listFollowedActivities(user.id, locale);
  }

  @Post('me/followed-activities/:activityId')
  followActivity(
    @CurrentUser() user: AuthenticatedUser,
    @Param('activityId') activityId: string,
  ) {
    return this.contributionsService.followActivity(user.id, activityId);
  }

  @Delete('me/followed-activities/:activityId')
  unfollowActivity(
    @CurrentUser() user: AuthenticatedUser,
    @Param('activityId') activityId: string,
  ) {
    return this.contributionsService.unfollowActivity(user.id, activityId);
  }

  @Post('activities/:activityId/comments')
  createActivityComment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('activityId') activityId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.contributionsService.createActivityComment(user.id, activityId, dto);
  }

  @Post('evidence/:evidenceId/comments')
  createEvidenceComment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('evidenceId') evidenceId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.contributionsService.createEvidenceComment(user.id, evidenceId, dto);
  }

  @Post('comments/:commentId/report')
  reportComment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('commentId') commentId: string,
    @Body() dto: ReportCommentDto,
  ) {
    return this.contributionsService.reportComment(user.id, commentId, dto);
  }
}
