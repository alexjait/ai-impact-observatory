import {
  Injectable,
} from '@nestjs/common';
import {
  CommentReportStatus,
  CommentVisibilityStatus,
  EditorialStatus,
  Locale,
  ModerationActionType,
  ModerationTargetType,
  Prisma,
} from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { ModerationActionDto } from './dto/moderation-action.dto';
import { ModerationQueueQueryDto } from './dto/moderation-queue-query.dto';
import { moderationErrors } from './moderation.errors';

type LocaleCode = 'en' | 'es';

@Injectable()
export class ModerationService {
  constructor(private readonly prisma: PrismaService) {}

  async getQueue(query: ModerationQueueQueryDto) {
    const locale = this.resolveLocale(query.locale);
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const type = query.type ?? 'activity_proposals';
    const summary = await this.buildSummary();

    switch (type) {
      case 'activity_proposals':
        return {
          summary,
          type,
          ...(await this.listActivityProposalQueue(
            query.status,
            query.q,
            locale,
            page,
            pageSize,
          )),
        };
      case 'evidence_proposals':
        return {
          summary,
          type,
          ...(await this.listEvidenceProposalQueue(
            query.status,
            query.q,
            locale,
            page,
            pageSize,
          )),
        };
      case 'comments':
        return {
          summary,
          type,
          ...(await this.listCommentQueue(
            query.status,
            query.q,
            locale,
            page,
            pageSize,
          )),
        };
      case 'activities':
        return {
          summary,
          type,
          ...(await this.listActivityEditorialQueue(
            query.status,
            query.q,
            locale,
            page,
            pageSize,
          )),
        };
      default:
        throw moderationErrors.unsupportedQueueType();
    }
  }

  async getActivityProposalDetail(proposalId: string, localeQuery?: LocaleCode) {
    const locale = this.resolveLocale(localeQuery);
    const proposal = await this.prisma.activityProposal.findUnique({
      where: { id: proposalId },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
        translations: true,
        industries: {
          include: {
            industry: {
              include: {
                translations: true,
              },
            },
          },
        },
        categories: {
          include: {
            functionalCategory: {
              include: {
                translations: true,
              },
            },
          },
        },
        moderationActions: {
          orderBy: { createdAt: 'desc' },
          include: {
            actor: {
              select: {
                id: true,
                displayName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!proposal) {
      throw moderationErrors.activityProposalNotFound();
    }

    const translation = this.pickTranslation(proposal.translations, locale);

    return {
      id: proposal.id,
      title: translation?.title ?? 'Untitled activity proposal',
      granularity: proposal.granularity,
      editorialStatus: proposal.editorialStatus,
      moderationNote: proposal.moderationNote,
      createdAt: proposal.createdAt,
      updatedAt: proposal.updatedAt,
      author: proposal.author,
      industryKeys: proposal.industries.map((item) => item.industry.key),
      categoryKeys: proposal.categories.map((item) => item.functionalCategory.key),
      industries: proposal.industries.map((item) =>
        this.mapNamedTranslation(item.industry.translations, locale, item.industry.key),
      ),
      categories: proposal.categories.map((item) =>
        this.mapNamedTranslation(
          item.functionalCategory.translations,
          locale,
          item.functionalCategory.key,
        ),
      ),
      translations: this.mapActivityProposalTranslations(proposal.translations),
      moderationHistory: proposal.moderationActions.map((action) => ({
        id: action.id,
        actionType: action.actionType,
        reason: action.reason,
        createdAt: action.createdAt,
        actor: action.actor,
      })),
    };
  }

  async getEvidenceProposalDetail(proposalId: string, localeQuery?: LocaleCode) {
    const locale = this.resolveLocale(localeQuery);
    const proposal = await this.prisma.evidenceProposal.findUnique({
      where: { id: proposalId },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
        translations: true,
        activities: {
          include: {
            activity: {
              include: {
                translations: true,
              },
            },
          },
        },
        moderationActions: {
          orderBy: { createdAt: 'desc' },
          include: {
            actor: {
              select: {
                id: true,
                displayName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!proposal) {
      throw moderationErrors.evidenceProposalNotFound();
    }

    const translation = this.pickTranslation(proposal.translations, locale);

    return {
      id: proposal.id,
      title: translation?.title ?? 'Untitled evidence proposal',
      type: proposal.type,
      sourceText: proposal.sourceText,
      sourceUrl: proposal.sourceUrl,
      eventDate: proposal.eventDate,
      editorialStatus: proposal.editorialStatus,
      moderationNote: proposal.moderationNote,
      createdAt: proposal.createdAt,
      updatedAt: proposal.updatedAt,
      author: proposal.author,
      activityKeys: proposal.activities.map((item) => item.activity.key),
      activities: proposal.activities.map((item) => {
        const activityTranslation = this.pickTranslation(item.activity.translations, locale);
        return {
          id: item.activity.id,
          key: item.activity.key,
          title: activityTranslation?.title ?? item.activity.key,
          slug: activityTranslation?.slug ?? null,
        };
      }),
      translations: this.mapEvidenceProposalTranslations(proposal.translations),
      moderationHistory: proposal.moderationActions.map((action) => ({
        id: action.id,
        actionType: action.actionType,
        reason: action.reason,
        createdAt: action.createdAt,
        actor: action.actor,
      })),
    };
  }

  async approveActivityProposal(actorUserId: string, proposalId: string, dto: ModerationActionDto) {
    return this.transitionActivityProposal(
      actorUserId,
      proposalId,
      dto.reason,
      EditorialStatus.approved,
      ModerationActionType.approve,
    );
  }

  async rejectActivityProposal(actorUserId: string, proposalId: string, dto: ModerationActionDto) {
    return this.transitionActivityProposal(
      actorUserId,
      proposalId,
      dto.reason,
      EditorialStatus.rejected,
      ModerationActionType.reject,
    );
  }

  async requestActivityProposalCorrection(
    actorUserId: string,
    proposalId: string,
    dto: ModerationActionDto,
  ) {
    return this.transitionActivityProposal(
      actorUserId,
      proposalId,
      dto.reason,
      EditorialStatus.needs_correction,
      ModerationActionType.request_correction,
    );
  }

  async approveEvidenceProposal(actorUserId: string, proposalId: string, dto: ModerationActionDto) {
    return this.transitionEvidenceProposal(
      actorUserId,
      proposalId,
      dto.reason,
      EditorialStatus.approved,
      ModerationActionType.approve,
    );
  }

  async rejectEvidenceProposal(actorUserId: string, proposalId: string, dto: ModerationActionDto) {
    return this.transitionEvidenceProposal(
      actorUserId,
      proposalId,
      dto.reason,
      EditorialStatus.rejected,
      ModerationActionType.reject,
    );
  }

  async requestEvidenceProposalCorrection(
    actorUserId: string,
    proposalId: string,
    dto: ModerationActionDto,
  ) {
    return this.transitionEvidenceProposal(
      actorUserId,
      proposalId,
      dto.reason,
      EditorialStatus.needs_correction,
      ModerationActionType.request_correction,
    );
  }

  async hideComment(actorUserId: string, commentId: string, dto: ModerationActionDto) {
    return this.transitionComment(
      actorUserId,
      commentId,
      dto.reason,
      CommentVisibilityStatus.hidden,
      ModerationActionType.hide,
      CommentReportStatus.resolved,
    );
  }

  async archiveComment(actorUserId: string, commentId: string, dto: ModerationActionDto) {
    return this.transitionComment(
      actorUserId,
      commentId,
      dto.reason,
      CommentVisibilityStatus.archived,
      ModerationActionType.archive,
      CommentReportStatus.resolved,
    );
  }

  async resolveCommentReport(actorUserId: string, commentId: string, dto: ModerationActionDto) {
    return this.transitionComment(
      actorUserId,
      commentId,
      dto.reason,
      undefined,
      ModerationActionType.resolve_report,
      CommentReportStatus.resolved,
    );
  }

  private async listActivityProposalQueue(
    status: string | undefined,
    q: string | undefined,
    locale: LocaleCode,
    page: number,
    pageSize: number,
  ) {
    const where = this.buildActivityProposalQueueWhere(status, q);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.activityProposal.findMany({
        where,
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          author: {
            select: {
              id: true,
              displayName: true,
              email: true,
            },
          },
          translations: true,
          industries: {
            include: {
              industry: true,
            },
          },
          categories: {
            include: {
              functionalCategory: true,
            },
          },
        },
      }),
      this.prisma.activityProposal.count({ where }),
    ]);

    return {
      items: items.map((proposal) => {
        const translation = this.pickTranslation(proposal.translations, locale);
        return {
          id: proposal.id,
          title: translation?.title ?? 'Untitled activity proposal',
          status: proposal.editorialStatus,
          moderationNote: proposal.moderationNote,
          granularity: proposal.granularity,
          createdAt: proposal.createdAt,
          author: proposal.author,
          industryKeys: proposal.industries.map((item) => item.industry.key),
          categoryKeys: proposal.categories.map((item) => item.functionalCategory.key),
          translationPreview: {
            en:
              proposal.translations.find((item) => item.locale === Locale.en) ?? null,
            es:
              proposal.translations.find((item) => item.locale === Locale.es) ?? null,
          },
        };
      }),
      total,
      page,
      pageSize,
    };
  }

  private async listEvidenceProposalQueue(
    status: string | undefined,
    q: string | undefined,
    locale: LocaleCode,
    page: number,
    pageSize: number,
  ) {
    const where = this.buildEvidenceProposalQueueWhere(status, q);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.evidenceProposal.findMany({
        where,
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          author: {
            select: {
              id: true,
              displayName: true,
              email: true,
            },
          },
          translations: true,
          activities: {
            include: {
              activity: true,
            },
          },
        },
      }),
      this.prisma.evidenceProposal.count({ where }),
    ]);

    return {
      items: items.map((proposal) => {
        const translation = this.pickTranslation(proposal.translations, locale);
        return {
          id: proposal.id,
          title: translation?.title ?? 'Untitled evidence proposal',
          status: proposal.editorialStatus,
          moderationNote: proposal.moderationNote,
          type: proposal.type,
          sourceText: proposal.sourceText,
          sourceUrl: proposal.sourceUrl,
          eventDate: proposal.eventDate,
          createdAt: proposal.createdAt,
          author: proposal.author,
          activityKeys: proposal.activities.map((item) => item.activity.key),
          translationPreview: {
            en:
              proposal.translations.find((item) => item.locale === Locale.en) ?? null,
            es:
              proposal.translations.find((item) => item.locale === Locale.es) ?? null,
          },
        };
      }),
      total,
      page,
      pageSize,
    };
  }

  private async listCommentQueue(
    status: string | undefined,
    q: string | undefined,
    locale: LocaleCode,
    page: number,
    pageSize: number,
  ) {
    const where = this.buildCommentQueueWhere(status, q);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.comment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          author: {
            select: {
              id: true,
              displayName: true,
              email: true,
            },
          },
          activity: {
            include: {
              translations: true,
            },
          },
          evidence: {
            include: {
              translations: true,
              activities: {
                include: {
                  activity: {
                    include: {
                      translations: true,
                    },
                  },
                },
              },
            },
          },
          reports: {
            orderBy: { createdAt: 'desc' },
            include: {
              reporter: {
                select: {
                  id: true,
                  displayName: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.comment.count({ where }),
    ]);

    return {
      items: items.map((comment) => {
        const activityTranslation = comment.activity
          ? this.pickTranslation(comment.activity.translations, locale)
          : null;
        const evidenceTranslation = comment.evidence
          ? this.pickTranslation(comment.evidence.translations, locale)
          : null;

        return {
          id: comment.id,
          text: comment.text,
          createdAt: comment.createdAt,
          reportStatus: comment.reportStatus,
          visibilityStatus: comment.visibilityStatus,
          author: comment.author,
          target: {
            activityId: comment.activityId,
            evidenceId: comment.evidenceId,
            parentCommentId: comment.parentCommentId,
            activity: comment.activity
              ? {
                  id: comment.activity.id,
                  key: comment.activity.key,
                  title: activityTranslation?.title ?? comment.activity.key,
                  slug: activityTranslation?.slug ?? null,
                }
              : null,
            evidence: comment.evidence
              ? {
                  id: comment.evidence.id,
                  type: comment.evidence.type,
                  title:
                    evidenceTranslation?.title ??
                    comment.evidence.sourceText,
                  slug: evidenceTranslation?.slug ?? null,
                  activityKeys: comment.evidence.activities.map(
                    (item) => item.activity.key,
                  ),
                  activityTitles: comment.evidence.activities.map((item) => {
                    const translation = this.pickTranslation(
                      item.activity.translations,
                      locale,
                    );

                    return translation?.title ?? item.activity.key;
                  }),
                }
              : null,
          },
          reports: comment.reports.map((report) => ({
            id: report.id,
            reason: report.reason,
            details: report.details,
            createdAt: report.createdAt,
            reporter: report.reporter,
          })),
        };
      }),
      total,
      page,
      pageSize,
    };
  }

  private async listActivityEditorialQueue(
    status: string | undefined,
    q: string | undefined,
    locale: LocaleCode,
    page: number,
    pageSize: number,
  ) {
    const where = this.buildActivityEditorialQueueWhere(status, q);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.activity.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          translations: true,
        },
      }),
      this.prisma.activity.count({ where }),
    ]);

    return {
      items: items.map((activity) => {
        const translation = this.pickTranslation(activity.translations, locale);
        return {
          id: activity.id,
          key: activity.key,
          title: translation?.title ?? activity.key,
          status: activity.editorialStatus,
          officialAiStatus: activity.officialAiStatus,
          hasEditorialSummary: Boolean(translation?.editorialSummary?.trim()),
          updatedAt: activity.updatedAt,
        };
      }),
      total,
      page,
      pageSize,
    };
  }

  private async buildSummary() {
    const [pendingActivityProposals, pendingEvidenceProposals, reportedComments, pendingActivities] =
      await this.prisma.$transaction([
        this.prisma.activityProposal.count({
          where: { editorialStatus: EditorialStatus.pending },
        }),
        this.prisma.evidenceProposal.count({
          where: { editorialStatus: EditorialStatus.pending },
        }),
        this.prisma.comment.count({
          where: {
            reportStatus: {
              in: [CommentReportStatus.reported, CommentReportStatus.under_review],
            },
          },
        }),
        this.prisma.activity.count({
          where: { editorialStatus: EditorialStatus.pending },
        }),
      ]);

    return {
      pendingActivityProposals,
      pendingEvidenceProposals,
      reportedComments,
      pendingActivities,
    };
  }

  private buildActivityProposalQueueWhere(
    status: string | undefined,
    q: string | undefined,
  ): Prisma.ActivityProposalWhereInput {
    const where: Prisma.ActivityProposalWhereInput = {};

    if (status && Object.values(EditorialStatus).includes(status as EditorialStatus)) {
      where.editorialStatus = status as EditorialStatus;
    }

    if (q?.trim()) {
      const term = q.trim();
      where.OR = [
        {
          author: {
            displayName: { contains: term, mode: 'insensitive' },
          },
        },
        {
          author: {
            email: { contains: term, mode: 'insensitive' },
          },
        },
        {
          translations: {
            some: {
              OR: [
                { title: { contains: term, mode: 'insensitive' } },
                { shortDescription: { contains: term, mode: 'insensitive' } },
                { fullDescription: { contains: term, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    return where;
  }

  private buildEvidenceProposalQueueWhere(
    status: string | undefined,
    q: string | undefined,
  ): Prisma.EvidenceProposalWhereInput {
    const where: Prisma.EvidenceProposalWhereInput = {};

    if (status && Object.values(EditorialStatus).includes(status as EditorialStatus)) {
      where.editorialStatus = status as EditorialStatus;
    }

    if (q?.trim()) {
      const term = q.trim();
      where.OR = [
        {
          author: {
            displayName: { contains: term, mode: 'insensitive' },
          },
        },
        {
          author: {
            email: { contains: term, mode: 'insensitive' },
          },
        },
        { type: { contains: term, mode: 'insensitive' } },
        { sourceText: { contains: term, mode: 'insensitive' } },
        {
          translations: {
            some: {
              OR: [
                { title: { contains: term, mode: 'insensitive' } },
                { summary: { contains: term, mode: 'insensitive' } },
                { context: { contains: term, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    return where;
  }

  private buildCommentQueueWhere(
    status: string | undefined,
    q: string | undefined,
  ): Prisma.CommentWhereInput {
    const where: Prisma.CommentWhereInput = {};
    const andClauses: Prisma.CommentWhereInput[] = [];

    if (status && Object.values(CommentReportStatus).includes(status as CommentReportStatus)) {
      where.reportStatus = status as CommentReportStatus;
    } else {
      where.reportStatus = {
        in: [CommentReportStatus.reported, CommentReportStatus.under_review],
      };
    }

    if (q?.trim()) {
      const term = q.trim();
      andClauses.push({
        OR: [
          { text: { contains: term, mode: 'insensitive' } },
          {
            author: {
              displayName: { contains: term, mode: 'insensitive' },
            },
          },
          {
            author: {
              email: { contains: term, mode: 'insensitive' },
            },
          },
          {
            reports: {
              some: {
                OR: [
                  { reason: { contains: term, mode: 'insensitive' } },
                  { details: { contains: term, mode: 'insensitive' } },
                ],
              },
            },
          },
          {
            activity: {
              OR: [
                { key: { contains: term, mode: 'insensitive' } },
                {
                  translations: {
                    some: {
                      OR: [
                        { title: { contains: term, mode: 'insensitive' } },
                        { shortDescription: { contains: term, mode: 'insensitive' } },
                        { fullDescription: { contains: term, mode: 'insensitive' } },
                        { editorialSummary: { contains: term, mode: 'insensitive' } },
                        { slug: { contains: term, mode: 'insensitive' } },
                      ],
                    },
                  },
                },
              ],
            },
          },
          {
            evidence: {
              OR: [
                { type: { contains: term, mode: 'insensitive' } },
                { sourceText: { contains: term, mode: 'insensitive' } },
                { sourceUrl: { contains: term, mode: 'insensitive' } },
                {
                  translations: {
                    some: {
                      OR: [
                        { title: { contains: term, mode: 'insensitive' } },
                        { summary: { contains: term, mode: 'insensitive' } },
                        { context: { contains: term, mode: 'insensitive' } },
                        { slug: { contains: term, mode: 'insensitive' } },
                      ],
                    },
                  },
                },
                {
                  activities: {
                    some: {
                      activity: {
                        OR: [
                          { key: { contains: term, mode: 'insensitive' } },
                          {
                            translations: {
                              some: {
                                OR: [
                                  { title: { contains: term, mode: 'insensitive' } },
                                  { slug: { contains: term, mode: 'insensitive' } },
                                ],
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              ],
            },
          },
        ],
      });
    }

    if (andClauses.length > 0) {
      where.AND = andClauses;
    }

    return where;
  }

  private buildActivityEditorialQueueWhere(
    status: string | undefined,
    q: string | undefined,
  ): Prisma.ActivityWhereInput {
    const where: Prisma.ActivityWhereInput = {};
    const andClauses: Prisma.ActivityWhereInput[] = [];

    if (status && Object.values(EditorialStatus).includes(status as EditorialStatus)) {
      where.editorialStatus = status as EditorialStatus;
    } else {
      where.editorialStatus = EditorialStatus.pending;
    }

    if (q?.trim()) {
      const term = q.trim();
      andClauses.push({
        OR: [
          { key: { contains: term, mode: 'insensitive' } },
          {
            translations: {
              some: {
                OR: [
                  { title: { contains: term, mode: 'insensitive' } },
                  { shortDescription: { contains: term, mode: 'insensitive' } },
                  { fullDescription: { contains: term, mode: 'insensitive' } },
                  { editorialSummary: { contains: term, mode: 'insensitive' } },
                ],
              },
            },
          },
        ],
      });
    }

    if (andClauses.length > 0) {
      where.AND = andClauses;
    }

    return where;
  }

  private async transitionActivityProposal(
    actorUserId: string,
    proposalId: string,
    reason: string,
    nextStatus: EditorialStatus,
    actionType: ModerationActionType,
  ) {
    const normalizedReason = reason.trim();
    if (!normalizedReason) {
      throw moderationErrors.moderationReasonRequired();
    }

    const proposal = await this.prisma.activityProposal.findUnique({
      where: { id: proposalId },
      include: {
        translations: true,
        industries: true,
        categories: true,
      },
    });
    if (!proposal) {
      throw moderationErrors.activityProposalNotFound();
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      let materializedActivityId = proposal.materializedActivityId;

      if (nextStatus === EditorialStatus.approved) {
        materializedActivityId = await this.materializeApprovedActivityProposal(
          tx,
          proposal,
          actorUserId,
          normalizedReason,
        );
      }

      const entity = await tx.activityProposal.update({
        where: { id: proposalId },
        data: {
          editorialStatus: nextStatus,
          moderationNote: normalizedReason,
          materializedActivityId,
        },
        include: {
          translations: true,
        },
      });

      await tx.moderationAction.create({
        data: {
          actorUserId,
          targetType: ModerationTargetType.activity_proposal,
          targetId: proposalId,
          actionType,
          reason: normalizedReason,
          activityProposalId: proposalId,
          metadataJson: {
            previousStatus: proposal.editorialStatus,
            newStatus: nextStatus,
          },
        },
      });

      return entity;
    });

    const translation = this.pickTranslation(updated.translations, 'en');
    return {
      id: updated.id,
      title: translation?.title ?? 'Untitled activity proposal',
      status: updated.editorialStatus,
      moderationNote: updated.moderationNote,
      materializedActivityId: updated.materializedActivityId ?? null,
    };
  }

  private async transitionEvidenceProposal(
    actorUserId: string,
    proposalId: string,
    reason: string,
    nextStatus: EditorialStatus,
    actionType: ModerationActionType,
  ) {
    const normalizedReason = reason.trim();
    if (!normalizedReason) {
      throw moderationErrors.moderationReasonRequired();
    }

    const proposal = await this.prisma.evidenceProposal.findUnique({
      where: { id: proposalId },
      include: {
        translations: true,
        activities: true,
      },
    });
    if (!proposal) {
      throw moderationErrors.evidenceProposalNotFound();
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      let materializedEvidenceId = proposal.materializedEvidenceId;

      if (nextStatus === EditorialStatus.approved) {
        materializedEvidenceId = await this.materializeApprovedEvidenceProposal(
          tx,
          proposal,
        );
      }

      const entity = await tx.evidenceProposal.update({
        where: { id: proposalId },
        data: {
          editorialStatus: nextStatus,
          moderationNote: normalizedReason,
          materializedEvidenceId,
        },
        include: {
          translations: true,
        },
      });

      await tx.moderationAction.create({
        data: {
          actorUserId,
          targetType: ModerationTargetType.evidence_proposal,
          targetId: proposalId,
          actionType,
          reason: normalizedReason,
          evidenceProposalId: proposalId,
          metadataJson: {
            previousStatus: proposal.editorialStatus,
            newStatus: nextStatus,
          },
        },
      });

      return entity;
    });

    const translation = this.pickTranslation(updated.translations, 'en');
    return {
      id: updated.id,
      title: translation?.title ?? 'Untitled evidence proposal',
      status: updated.editorialStatus,
      moderationNote: updated.moderationNote,
      materializedEvidenceId: updated.materializedEvidenceId ?? null,
    };
  }

  private async transitionComment(
    actorUserId: string,
    commentId: string,
    reason: string,
    nextVisibilityStatus: CommentVisibilityStatus | undefined,
    actionType: ModerationActionType,
    nextReportStatus: CommentReportStatus,
  ) {
    const normalizedReason = reason.trim();
    if (!normalizedReason) {
      throw moderationErrors.moderationReasonRequired();
    }

    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) {
      throw moderationErrors.commentNotFound();
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const entity = await tx.comment.update({
        where: { id: commentId },
        data: {
          ...(nextVisibilityStatus ? { visibilityStatus: nextVisibilityStatus } : {}),
          reportStatus: nextReportStatus,
        },
      });

      await tx.moderationAction.create({
        data: {
          actorUserId,
          targetType: ModerationTargetType.comment,
          targetId: commentId,
          actionType,
          reason: normalizedReason,
          commentId,
          metadataJson: {
            previousVisibilityStatus: comment.visibilityStatus,
            newVisibilityStatus: nextVisibilityStatus ?? comment.visibilityStatus,
            previousReportStatus: comment.reportStatus,
            newReportStatus: nextReportStatus,
          },
        },
      });

      return entity;
    });

    return {
      id: updated.id,
      visibilityStatus: updated.visibilityStatus,
      reportStatus: updated.reportStatus,
    };
  }

  private async materializeApprovedActivityProposal(
    tx: Prisma.TransactionClient,
    proposal: Prisma.ActivityProposalGetPayload<{
      include: {
        translations: true;
        industries: true;
        categories: true;
      };
    }>,
    actorUserId: string,
    rationale: string,
  ) {
    const enTranslation =
      proposal.translations.find((item) => item.locale === Locale.en) ??
      proposal.translations.find((item) => item.locale === Locale.es) ??
      null;
    const esTranslation =
      proposal.translations.find((item) => item.locale === Locale.es) ??
      proposal.translations.find((item) => item.locale === Locale.en) ??
      null;

    const baseKey = this.slugifyValue(
      enTranslation?.title ?? esTranslation?.title ?? `activity-${proposal.id}`,
    );
    const key = await this.ensureUniqueActivityKey(
      tx,
      baseKey || `activity-${proposal.id.toLowerCase()}`,
      proposal.materializedActivityId ?? undefined,
    );
    const enSlug = await this.ensureUniqueActivitySlug(
      tx,
      Locale.en,
      this.slugifyValue(enTranslation?.title ?? esTranslation?.title ?? key) || key,
      proposal.materializedActivityId ?? undefined,
    );
    const esSlug = await this.ensureUniqueActivitySlug(
      tx,
      Locale.es,
      this.slugifyValue(esTranslation?.title ?? enTranslation?.title ?? key) || key,
      proposal.materializedActivityId ?? undefined,
    );

    if (proposal.materializedActivityId) {
      const existing = await tx.activity.findUnique({
        where: { id: proposal.materializedActivityId },
      });

      if (!existing) {
        throw moderationErrors.materializedActivityNotFound();
      }

      await tx.activity.update({
        where: { id: proposal.materializedActivityId },
        data: {
          key,
          granularity: proposal.granularity,
          editorialStatus: EditorialStatus.approved,
          translations: {
            updateMany: [
              {
                where: { locale: Locale.en },
                data: {
                  title: enTranslation?.title ?? esTranslation?.title ?? key,
                  shortDescription:
                    enTranslation?.shortDescription ?? esTranslation?.shortDescription ?? null,
                  fullDescription:
                    enTranslation?.fullDescription ?? esTranslation?.fullDescription ?? null,
                  slug: enSlug,
                },
              },
              {
                where: { locale: Locale.es },
                data: {
                  title: esTranslation?.title ?? enTranslation?.title ?? key,
                  shortDescription:
                    esTranslation?.shortDescription ?? enTranslation?.shortDescription ?? null,
                  fullDescription:
                    esTranslation?.fullDescription ?? enTranslation?.fullDescription ?? null,
                  slug: esSlug,
                },
              },
            ],
          },
        },
      });

      await tx.activityIndustry.deleteMany({
        where: { activityId: proposal.materializedActivityId },
      });
      if (proposal.industries.length) {
        await tx.activityIndustry.createMany({
          data: proposal.industries.map((item) => ({
            activityId: proposal.materializedActivityId as string,
            industryId: item.industryId,
          })),
        });
      }

      await tx.activityCategory.deleteMany({
        where: { activityId: proposal.materializedActivityId },
      });
      if (proposal.categories.length) {
        await tx.activityCategory.createMany({
          data: proposal.categories.map((item) => ({
            activityId: proposal.materializedActivityId as string,
            functionalCategoryId: item.functionalCategoryId,
          })),
        });
      }

      await tx.editorialActivityStatusHistory.create({
        data: {
          activityId: proposal.materializedActivityId,
          actorUserId,
          previousOfficialAiStatus: existing.officialAiStatus,
          newOfficialAiStatus: existing.officialAiStatus,
          previousEditorialStatus: existing.editorialStatus,
          newEditorialStatus: EditorialStatus.approved,
          rationale,
        },
      });

      return proposal.materializedActivityId;
    }

    const created = await tx.activity.create({
      data: {
        key,
        granularity: proposal.granularity,
        editorialStatus: EditorialStatus.approved,
        translations: {
          create: [
            {
              locale: Locale.en,
              title: enTranslation?.title ?? esTranslation?.title ?? key,
              shortDescription:
                enTranslation?.shortDescription ?? esTranslation?.shortDescription ?? null,
              fullDescription:
                enTranslation?.fullDescription ?? esTranslation?.fullDescription ?? null,
              slug: enSlug,
            },
            {
              locale: Locale.es,
              title: esTranslation?.title ?? enTranslation?.title ?? key,
              shortDescription:
                esTranslation?.shortDescription ?? enTranslation?.shortDescription ?? null,
              fullDescription:
                esTranslation?.fullDescription ?? enTranslation?.fullDescription ?? null,
              slug: esSlug,
            },
          ],
        },
        industries: {
          create: proposal.industries.map((item) => ({
            industryId: item.industryId,
          })),
        },
        categories: {
          create: proposal.categories.map((item) => ({
            functionalCategoryId: item.functionalCategoryId,
          })),
        },
      },
    });

    await tx.editorialActivityStatusHistory.create({
      data: {
        activityId: created.id,
        actorUserId,
        previousOfficialAiStatus: null,
        newOfficialAiStatus: null,
        previousEditorialStatus: null,
        newEditorialStatus: EditorialStatus.approved,
        rationale,
      },
    });

    return created.id;
  }

  private async materializeApprovedEvidenceProposal(
    tx: Prisma.TransactionClient,
    proposal: Prisma.EvidenceProposalGetPayload<{
      include: {
        translations: true;
        activities: true;
      };
    }>,
  ) {
    const enTranslation =
      proposal.translations.find((item) => item.locale === Locale.en) ??
      proposal.translations.find((item) => item.locale === Locale.es) ??
      null;
    const esTranslation =
      proposal.translations.find((item) => item.locale === Locale.es) ??
      proposal.translations.find((item) => item.locale === Locale.en) ??
      null;

    const keyBaseParts = [
      this.slugifyValue(enTranslation?.title ?? esTranslation?.title ?? ''),
      proposal.eventDate ? proposal.eventDate.toISOString().slice(0, 10) : null,
    ].filter(Boolean);
    const key = await this.ensureUniqueEvidenceKey(
      tx,
      keyBaseParts.join('-') || `evidence-${proposal.id.toLowerCase()}`,
      proposal.materializedEvidenceId ?? undefined,
    );
    const enSlug = await this.ensureUniqueEvidenceSlug(
      tx,
      Locale.en,
      this.slugifyValue(enTranslation?.title ?? esTranslation?.title ?? key) || key,
      proposal.materializedEvidenceId ?? undefined,
    );
    const esSlug = await this.ensureUniqueEvidenceSlug(
      tx,
      Locale.es,
      this.slugifyValue(esTranslation?.title ?? enTranslation?.title ?? key) || key,
      proposal.materializedEvidenceId ?? undefined,
    );

    if (proposal.materializedEvidenceId) {
      const existing = await tx.evidence.findUnique({
        where: { id: proposal.materializedEvidenceId },
      });

      if (!existing) {
        throw moderationErrors.materializedEvidenceNotFound();
      }

      await tx.evidence.update({
        where: { id: proposal.materializedEvidenceId },
        data: {
          key,
          editorialStatus: EditorialStatus.approved,
          type: proposal.type,
          sourceText: proposal.sourceText,
          sourceUrl: proposal.sourceUrl,
          eventDate: proposal.eventDate,
          translations: {
            updateMany: [
              {
                where: { locale: Locale.en },
                data: {
                  title: enTranslation?.title ?? esTranslation?.title ?? key,
                  summary: enTranslation?.summary ?? esTranslation?.summary ?? '',
                  context: enTranslation?.context ?? esTranslation?.context ?? '',
                  slug: enSlug,
                },
              },
              {
                where: { locale: Locale.es },
                data: {
                  title: esTranslation?.title ?? enTranslation?.title ?? key,
                  summary: esTranslation?.summary ?? enTranslation?.summary ?? '',
                  context: esTranslation?.context ?? enTranslation?.context ?? '',
                  slug: esSlug,
                },
              },
            ],
          },
        },
      });

      await tx.evidenceActivity.deleteMany({
        where: { evidenceId: proposal.materializedEvidenceId },
      });
      if (proposal.activities.length) {
        await tx.evidenceActivity.createMany({
          data: proposal.activities.map((item) => ({
            evidenceId: proposal.materializedEvidenceId as string,
            activityId: item.activityId,
          })),
        });
      }

      return proposal.materializedEvidenceId;
    }

    const created = await tx.evidence.create({
      data: {
        key,
        editorialStatus: EditorialStatus.approved,
        type: proposal.type,
        sourceText: proposal.sourceText,
        sourceUrl: proposal.sourceUrl,
        eventDate: proposal.eventDate,
        translations: {
          create: [
            {
              locale: Locale.en,
              title: enTranslation?.title ?? esTranslation?.title ?? key,
              summary: enTranslation?.summary ?? esTranslation?.summary ?? '',
              context: enTranslation?.context ?? esTranslation?.context ?? '',
              slug: enSlug,
            },
            {
              locale: Locale.es,
              title: esTranslation?.title ?? enTranslation?.title ?? key,
              summary: esTranslation?.summary ?? enTranslation?.summary ?? '',
              context: esTranslation?.context ?? enTranslation?.context ?? '',
              slug: esSlug,
            },
          ],
        },
        activities: {
          create: proposal.activities.map((item) => ({
            activityId: item.activityId,
          })),
        },
      },
    });

    return created.id;
  }

  private async ensureUniqueActivityKey(
    tx: Prisma.TransactionClient,
    baseKey: string,
    excludeActivityId?: string,
  ) {
    const normalizedBase = this.slugifyValue(baseKey) || 'activity';
    let candidate = normalizedBase;
    let attempt = 2;

    while (
      await tx.activity.count({
        where: {
          key: candidate,
          ...(excludeActivityId ? { id: { not: excludeActivityId } } : {}),
        },
      })
    ) {
      candidate = `${normalizedBase}-${attempt}`;
      attempt += 1;
    }

    return candidate;
  }

  private async ensureUniqueEvidenceKey(
    tx: Prisma.TransactionClient,
    baseKey: string,
    excludeEvidenceId?: string,
  ) {
    const normalizedBase = this.slugifyValue(baseKey) || 'evidence';
    let candidate = normalizedBase;
    let attempt = 2;

    while (
      await tx.evidence.count({
        where: {
          key: candidate,
          ...(excludeEvidenceId ? { id: { not: excludeEvidenceId } } : {}),
        },
      })
    ) {
      candidate = `${normalizedBase}-${attempt}`;
      attempt += 1;
    }

    return candidate;
  }

  private async ensureUniqueActivitySlug(
    tx: Prisma.TransactionClient,
    locale: Locale,
    baseSlug: string,
    excludeActivityId?: string,
  ) {
    const normalizedBase = this.slugifyValue(baseSlug) || 'activity';
    let candidate = normalizedBase;
    let attempt = 2;

    while (
      await tx.activityTranslation.count({
        where: {
          locale,
          slug: candidate,
          ...(excludeActivityId ? { activityId: { not: excludeActivityId } } : {}),
        },
      })
    ) {
      candidate = `${normalizedBase}-${attempt}`;
      attempt += 1;
    }

    return candidate;
  }

  private async ensureUniqueEvidenceSlug(
    tx: Prisma.TransactionClient,
    locale: Locale,
    baseSlug: string,
    excludeEvidenceId?: string,
  ) {
    const normalizedBase = this.slugifyValue(baseSlug) || 'evidence';
    let candidate = normalizedBase;
    let attempt = 2;

    while (
      await tx.evidenceTranslation.count({
        where: {
          locale,
          slug: candidate,
          ...(excludeEvidenceId ? { evidenceId: { not: excludeEvidenceId } } : {}),
        },
      })
    ) {
      candidate = `${normalizedBase}-${attempt}`;
      attempt += 1;
    }

    return candidate;
  }

  private slugifyValue(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');
  }

  private pickTranslation<
    T extends {
      locale: Locale;
      title?: string | null;
      shortDescription?: string | null;
      fullDescription?: string | null;
      summary?: string | null;
      context?: string | null;
      editorialSummary?: string | null;
      slug?: string | null;
      name?: string | null;
    },
  >(translations: T[], locale: LocaleCode): T | null {
    return (
      translations.find((translation) => translation.locale === locale) ??
      translations.find((translation) => translation.locale === Locale.en) ??
      translations[0] ??
      null
    );
  }

  private mapNamedTranslation(
    translations: Array<{
      locale: Locale;
      name: string;
      slug: string;
    }>,
    locale: LocaleCode,
    key: string,
  ) {
    const translation = this.pickTranslation(translations, locale);
    return {
      key,
      name: translation?.name ?? key,
      slug: translation?.slug ?? key,
    };
  }

  private mapActivityProposalTranslations(
    translations: Array<{
      locale: Locale;
      title: string;
      shortDescription: string | null;
      fullDescription: string | null;
    }>,
  ) {
    const en = translations.find((item) => item.locale === Locale.en);
    const es = translations.find((item) => item.locale === Locale.es);

    return {
      en: {
        title: en?.title ?? '',
        shortDescription: en?.shortDescription ?? null,
        fullDescription: en?.fullDescription ?? null,
      },
      es: {
        title: es?.title ?? '',
        shortDescription: es?.shortDescription ?? null,
        fullDescription: es?.fullDescription ?? null,
      },
    };
  }

  private mapEvidenceProposalTranslations(
    translations: Array<{
      locale: Locale;
      title: string;
      summary: string;
      context: string;
    }>,
  ) {
    const en = translations.find((item) => item.locale === Locale.en);
    const es = translations.find((item) => item.locale === Locale.es);

    return {
      en: {
        title: en?.title ?? '',
        summary: en?.summary ?? '',
        context: en?.context ?? '',
      },
      es: {
        title: es?.title ?? '',
        summary: es?.summary ?? '',
        context: es?.context ?? '',
      },
    };
  }

  private resolveLocale(locale?: LocaleCode): LocaleCode {
    return locale === 'es' ? 'es' : 'en';
  }
}
