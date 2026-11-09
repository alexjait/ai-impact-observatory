import {
  Injectable,
} from '@nestjs/common';
import {
  CommentReportStatus,
  CommentVisibilityStatus,
  EditorialStatus,
  Locale,
  type Prisma,
} from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateActivityProposalDto,
  UpdateActivityProposalDto,
} from './dto/activity-proposal.dto';
import { CreateCommentDto } from './dto/comment.dto';
import {
  CreateEvidenceProposalDto,
  UpdateEvidenceProposalDto,
} from './dto/evidence-proposal.dto';
import { ReportCommentDto } from './dto/report-comment.dto';
import { TranslationService } from './translation.service';
import { contributionsErrors } from './contributions.errors';

type LocaleCode = 'en' | 'es';

@Injectable()
export class ContributionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly translationService: TranslationService,
  ) {}

  async createActivityProposal(userId: string, dto: CreateActivityProposalDto) {
    const [industries, categories] = await Promise.all([
      this.getIndustriesByKeys(dto.industryKeys),
      this.getCategoriesByKeys(dto.categoryKeys),
    ]);
    const translations = await this.resolveActivityTranslations(dto);

    const proposal = await this.prisma.activityProposal.create({
      data: {
        authorUserId: userId,
        granularity: dto.granularity,
        translations: {
          create: [
            {
              locale: Locale.es,
              title: translations.es.title,
              shortDescription: translations.es.shortDescription,
              fullDescription: translations.es.fullDescription,
            },
            {
              locale: Locale.en,
              title: translations.en.title,
              shortDescription: translations.en.shortDescription,
              fullDescription: translations.en.fullDescription,
            },
          ],
        },
        industries: {
          create: industries.map((industry) => ({
            industryId: industry.id,
          })),
        },
        categories: {
          create: categories.map((category) => ({
            functionalCategoryId: category.id,
          })),
        },
      },
      include: this.activityProposalInclude(),
    });

    return this.mapActivityProposalSummary(proposal, 'en');
  }

  async listActivityProposals(userId: string, locale?: LocaleCode) {
    const proposals = await this.prisma.activityProposal.findMany({
      where: { authorUserId: userId },
      orderBy: { createdAt: 'desc' },
      include: this.activityProposalInclude(),
    });

    return proposals.map((proposal) =>
      this.mapActivityProposalSummary(proposal, this.resolveLocale(locale)),
    );
  }

  async getActivityProposalDetail(userId: string, proposalId: string) {
    const proposal = await this.prisma.activityProposal.findFirst({
      where: {
        id: proposalId,
        authorUserId: userId,
      },
      include: this.activityProposalDetailInclude(),
    });

    if (!proposal) {
      throw contributionsErrors.activityProposalNotFound();
    }

    return this.mapActivityProposalDetail(proposal);
  }

  async updateActivityProposal(
    userId: string,
    proposalId: string,
    dto: UpdateActivityProposalDto,
  ) {
    const proposal = await this.prisma.activityProposal.findFirst({
      where: {
        id: proposalId,
        authorUserId: userId,
      },
      include: this.activityProposalInclude(),
    });

    if (!proposal) {
      throw contributionsErrors.activityProposalNotFound();
    }

    if (!this.isUserEditableStatus(proposal.editorialStatus)) {
      throw contributionsErrors.activityProposalNotEditable();
    }

    const industries = dto.industryKeys
      ? await this.getIndustriesByKeys(dto.industryKeys)
      : null;
    const categories = dto.categoryKeys
      ? await this.getCategoriesByKeys(dto.categoryKeys)
      : null;
    const translations =
      dto.translations || dto.translationInput
        ? await this.resolveActivityTranslations(dto)
        : null;

    const updatedProposal = await this.prisma.$transaction(async (tx) => {
      await tx.activityProposal.update({
        where: { id: proposalId },
        data: {
          granularity: dto.granularity,
          editorialStatus:
            proposal.editorialStatus === EditorialStatus.needs_correction
              ? EditorialStatus.pending
              : proposal.editorialStatus,
        },
      });

      if (industries) {
        await tx.activityProposalIndustry.deleteMany({
          where: { activityProposalId: proposalId },
        });
        await tx.activityProposalIndustry.createMany({
          data: industries.map((industry) => ({
            activityProposalId: proposalId,
            industryId: industry.id,
          })),
        });
      }

      if (categories) {
        await tx.activityProposalCategory.deleteMany({
          where: { activityProposalId: proposalId },
        });
        await tx.activityProposalCategory.createMany({
          data: categories.map((category) => ({
            activityProposalId: proposalId,
            functionalCategoryId: category.id,
          })),
        });
      }

      if (translations) {
        await tx.activityProposalTranslation.deleteMany({
          where: { activityProposalId: proposalId },
        });
        await tx.activityProposalTranslation.createMany({
          data: [
            {
              activityProposalId: proposalId,
              locale: Locale.es,
              title: translations.es.title,
              shortDescription: translations.es.shortDescription,
              fullDescription: translations.es.fullDescription,
            },
            {
              activityProposalId: proposalId,
              locale: Locale.en,
              title: translations.en.title,
              shortDescription: translations.en.shortDescription,
              fullDescription: translations.en.fullDescription,
            },
          ],
        });
      }

      return tx.activityProposal.findUniqueOrThrow({
        where: { id: proposalId },
        include: this.activityProposalInclude(),
      });
    });

    return this.mapActivityProposalSummary(updatedProposal, 'en');
  }

  async createEvidenceProposal(userId: string, dto: CreateEvidenceProposalDto) {
    const activities = await this.getActivitiesByKeys(dto.activityKeys);
    const translations = await this.resolveEvidenceTranslations(dto);

    const proposal = await this.prisma.evidenceProposal.create({
      data: {
        authorUserId: userId,
        type: dto.type.trim(),
        sourceText: dto.sourceText.trim(),
        sourceUrl: dto.sourceUrl?.trim() || null,
        eventDate: dto.eventDate ? new Date(dto.eventDate) : null,
        translations: {
          create: [
            {
              locale: Locale.es,
              title: translations.es.title,
              summary: translations.es.summary,
              context: translations.es.context,
            },
            {
              locale: Locale.en,
              title: translations.en.title,
              summary: translations.en.summary,
              context: translations.en.context,
            },
          ],
        },
        activities: {
          create: activities.map((activity) => ({
            activityId: activity.id,
          })),
        },
      },
      include: this.evidenceProposalInclude(),
    });

    return this.mapEvidenceProposalSummary(proposal, 'en');
  }

  async listEvidenceProposals(userId: string, locale?: LocaleCode) {
    const proposals = await this.prisma.evidenceProposal.findMany({
      where: { authorUserId: userId },
      orderBy: { createdAt: 'desc' },
      include: this.evidenceProposalInclude(),
    });

    return proposals.map((proposal) =>
      this.mapEvidenceProposalSummary(proposal, this.resolveLocale(locale)),
    );
  }

  async getEvidenceProposalDetail(userId: string, proposalId: string) {
    const proposal = await this.prisma.evidenceProposal.findFirst({
      where: {
        id: proposalId,
        authorUserId: userId,
      },
      include: this.evidenceProposalDetailInclude(),
    });

    if (!proposal) {
      throw contributionsErrors.evidenceProposalNotFound();
    }

    return this.mapEvidenceProposalDetail(proposal);
  }

  async updateEvidenceProposal(
    userId: string,
    proposalId: string,
    dto: UpdateEvidenceProposalDto,
  ) {
    const proposal = await this.prisma.evidenceProposal.findFirst({
      where: {
        id: proposalId,
        authorUserId: userId,
      },
      include: this.evidenceProposalInclude(),
    });

    if (!proposal) {
      throw contributionsErrors.evidenceProposalNotFound();
    }

    if (!this.isUserEditableStatus(proposal.editorialStatus)) {
      throw contributionsErrors.evidenceProposalNotEditable();
    }

    const activities = dto.activityKeys
      ? await this.getActivitiesByKeys(dto.activityKeys)
      : null;
    const translations =
      dto.translations || dto.translationInput
        ? await this.resolveEvidenceTranslations(dto)
        : null;

    const updatedProposal = await this.prisma.$transaction(async (tx) => {
      await tx.evidenceProposal.update({
        where: { id: proposalId },
        data: {
          type: dto.type?.trim(),
          sourceText: dto.sourceText?.trim(),
          sourceUrl: dto.sourceUrl?.trim() || (dto.sourceUrl === undefined ? undefined : null),
          eventDate: dto.eventDate ? new Date(dto.eventDate) : dto.eventDate === undefined ? undefined : null,
          editorialStatus:
            proposal.editorialStatus === EditorialStatus.needs_correction
              ? EditorialStatus.pending
              : proposal.editorialStatus,
        },
      });

      if (activities) {
        await tx.evidenceProposalActivity.deleteMany({
          where: { evidenceProposalId: proposalId },
        });
        await tx.evidenceProposalActivity.createMany({
          data: activities.map((activity) => ({
            evidenceProposalId: proposalId,
            activityId: activity.id,
          })),
        });
      }

      if (translations) {
        await tx.evidenceProposalTranslation.deleteMany({
          where: { evidenceProposalId: proposalId },
        });
        await tx.evidenceProposalTranslation.createMany({
          data: [
            {
              evidenceProposalId: proposalId,
              locale: Locale.es,
              title: translations.es.title,
              summary: translations.es.summary,
              context: translations.es.context,
            },
            {
              evidenceProposalId: proposalId,
              locale: Locale.en,
              title: translations.en.title,
              summary: translations.en.summary,
              context: translations.en.context,
            },
          ],
        });
      }

      return tx.evidenceProposal.findUniqueOrThrow({
        where: { id: proposalId },
        include: this.evidenceProposalInclude(),
      });
    });

    return this.mapEvidenceProposalSummary(updatedProposal, 'en');
  }

  async listFollowedActivities(userId: string, locale?: LocaleCode) {
    const resolvedLocale = this.resolveLocale(locale);
    const follows = await this.prisma.activityFollow.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        activity: {
          include: this.followedActivityInclude(),
        },
      },
    });

    return follows.map((follow) =>
      this.mapFollowedActivityCard(follow.activity, resolvedLocale, follow.createdAt),
    );
  }

  async followActivity(userId: string, activityId: string) {
    const activity = await this.prisma.activity.findFirst({
      where: {
        id: activityId,
        editorialStatus: EditorialStatus.approved,
      },
      select: {
        id: true,
      },
    });

    if (!activity) {
      throw contributionsErrors.publicActivityNotFound();
    }

    await this.prisma.activityFollow.upsert({
      where: {
        userId_activityId: {
          userId,
          activityId,
        },
      },
      update: {},
      create: {
        userId,
        activityId,
      },
    });

    return {
      activityId,
      isFollowing: true,
    };
  }

  async unfollowActivity(userId: string, activityId: string) {
    await this.prisma.activityFollow.deleteMany({
      where: {
        userId,
        activityId,
      },
    });

    return {
      activityId,
      isFollowing: false,
    };
  }

  async createActivityComment(
    userId: string,
    activityId: string,
    dto: CreateCommentDto,
  ) {
    const activity = await this.prisma.activity.findFirst({
      where: {
        id: activityId,
        editorialStatus: EditorialStatus.approved,
      },
    });

    if (!activity) {
      throw contributionsErrors.activityNotFound();
    }

    const parentCommentId = await this.validateParentComment(dto.parentCommentId, {
      activityId,
    });

    const comment = await this.prisma.comment.create({
      data: {
        authorUserId: userId,
        activityId,
        parentCommentId,
        text: this.normalizeCommentText(dto.text),
      },
      include: this.commentInclude(),
    });

    return this.mapComment(comment);
  }

  async createEvidenceComment(
    userId: string,
    evidenceId: string,
    dto: CreateCommentDto,
  ) {
    const evidence = await this.prisma.evidence.findFirst({
      where: {
        id: evidenceId,
        editorialStatus: EditorialStatus.approved,
      },
    });

    if (!evidence) {
      throw contributionsErrors.evidenceNotFound();
    }

    const parentCommentId = await this.validateParentComment(dto.parentCommentId, {
      evidenceId,
    });

    const comment = await this.prisma.comment.create({
      data: {
        authorUserId: userId,
        evidenceId,
        parentCommentId,
        text: this.normalizeCommentText(dto.text),
      },
      include: this.commentInclude(),
    });

    return this.mapComment(comment);
  }

  async reportComment(
    userId: string,
    commentId: string,
    dto: ReportCommentDto,
  ): Promise<{ accepted: true }> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw contributionsErrors.commentNotFound();
    }

    if (comment.authorUserId === userId) {
      throw contributionsErrors.cannotReportOwnComment();
    }

    await this.prisma.$transaction([
      this.prisma.commentReport.upsert({
        where: {
          commentId_reporterUserId: {
            commentId,
            reporterUserId: userId,
          },
        },
        update: {
          reason: dto.reason.trim(),
          details: dto.details?.trim() || null,
        },
        create: {
          commentId,
          reporterUserId: userId,
          reason: dto.reason.trim(),
          details: dto.details?.trim() || null,
        },
      }),
      this.prisma.comment.update({
        where: { id: commentId },
        data: {
          reportStatus: CommentReportStatus.reported,
        },
      }),
    ]);

    return { accepted: true };
  }

  private async getIndustriesByKeys(keys: string[]) {
    const industries = await this.prisma.industry.findMany({
      where: {
        key: { in: keys },
        isActive: true,
      },
    });

    if (industries.length !== keys.length) {
      throw contributionsErrors.invalidIndustries();
    }

    return industries;
  }

  private async getCategoriesByKeys(keys: string[]) {
    const categories = await this.prisma.functionalCategory.findMany({
      where: {
        key: { in: keys },
        isActive: true,
      },
    });

    if (categories.length !== keys.length) {
      throw contributionsErrors.invalidCategories();
    }

    return categories;
  }

  private async getActivitiesByKeys(keys: string[]) {
    const activities = await this.prisma.activity.findMany({
      where: {
        key: { in: keys },
        editorialStatus: EditorialStatus.approved,
      },
    });

    if (activities.length !== keys.length) {
      throw contributionsErrors.invalidActivities();
    }

    return activities;
  }

  private async validateParentComment(
    parentCommentId: string | undefined,
    target: { activityId?: string; evidenceId?: string },
  ): Promise<string | undefined> {
    if (!parentCommentId) {
      return undefined;
    }

    const parent = await this.prisma.comment.findUnique({
      where: { id: parentCommentId },
    });

    if (!parent || parent.visibilityStatus !== CommentVisibilityStatus.visible) {
      throw contributionsErrors.parentCommentInvalid();
    }

    if (parent.parentCommentId) {
      throw contributionsErrors.onlyOneReplyLevelAllowed();
    }

    const sameActivity = target.activityId && parent.activityId === target.activityId;
    const sameEvidence = target.evidenceId && parent.evidenceId === target.evidenceId;

    if (!sameActivity && !sameEvidence) {
      throw contributionsErrors.parentCommentEntityMismatch();
    }

    return parent.id;
  }

  private normalizeCommentText(text: string): string {
    const normalized = text.trim();
    if (!normalized) {
      throw contributionsErrors.commentTextRequired();
    }

    return normalized;
  }

  private activityProposalInclude() {
    return {
      translations: true,
    } satisfies Prisma.ActivityProposalInclude;
  }

  private evidenceProposalInclude() {
    return {
      translations: true,
    } satisfies Prisma.EvidenceProposalInclude;
  }

  private activityProposalDetailInclude() {
    return {
      translations: true,
      industries: {
        include: {
          industry: {
            select: {
              key: true,
            },
          },
        },
      },
      categories: {
        include: {
          functionalCategory: {
            select: {
              key: true,
            },
          },
        },
      },
    } satisfies Prisma.ActivityProposalInclude;
  }

  private evidenceProposalDetailInclude() {
    return {
      translations: true,
      activities: {
        include: {
          activity: {
            select: {
              key: true,
            },
          },
        },
      },
    } satisfies Prisma.EvidenceProposalInclude;
  }

  private commentInclude() {
    return {
      author: {
        select: {
          id: true,
          displayName: true,
        },
      },
      replies: {
        where: {
          visibilityStatus: CommentVisibilityStatus.visible,
        },
        orderBy: {
          createdAt: 'asc',
        },
        include: {
          author: {
            select: {
              id: true,
              displayName: true,
            },
          },
        },
      },
    } satisfies Prisma.CommentInclude;
  }

  private followedActivityInclude() {
    return {
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
    } satisfies Prisma.ActivityInclude;
  }

  private mapActivityProposalSummary(
    proposal: Prisma.ActivityProposalGetPayload<{
      include: ReturnType<ContributionsService['activityProposalInclude']>;
    }>,
    locale: LocaleCode,
  ) {
    const translation = this.pickTranslation(proposal.translations, locale);
    return {
      id: proposal.id,
      title: translation?.title ?? 'Untitled activity proposal',
      status: proposal.editorialStatus,
      createdAt: proposal.createdAt,
    };
  }

  private mapEvidenceProposalSummary(
    proposal: Prisma.EvidenceProposalGetPayload<{
      include: ReturnType<ContributionsService['evidenceProposalInclude']>;
    }>,
    locale: LocaleCode,
  ) {
    const translation = this.pickTranslation(proposal.translations, locale);
    return {
      id: proposal.id,
      title: translation?.title ?? 'Untitled evidence proposal',
      status: proposal.editorialStatus,
      createdAt: proposal.createdAt,
    };
  }

  private mapActivityProposalDetail(
    proposal: Prisma.ActivityProposalGetPayload<{
      include: ReturnType<ContributionsService['activityProposalDetailInclude']>;
    }>,
  ) {
    return {
      id: proposal.id,
      status: proposal.editorialStatus,
      moderationNote: proposal.moderationNote,
      granularity: proposal.granularity,
      createdAt: proposal.createdAt,
      updatedAt: proposal.updatedAt,
      canEdit: this.isUserEditableStatus(proposal.editorialStatus),
      industryKeys: proposal.industries.map((item) => item.industry.key),
      categoryKeys: proposal.categories.map((item) => item.functionalCategory.key),
      translations: this.mapProposalTranslations(proposal.translations, {
        shortDescription: true,
        fullDescription: true,
      }),
    };
  }

  private mapEvidenceProposalDetail(
    proposal: Prisma.EvidenceProposalGetPayload<{
      include: ReturnType<ContributionsService['evidenceProposalDetailInclude']>;
    }>,
  ) {
    return {
      id: proposal.id,
      status: proposal.editorialStatus,
      moderationNote: proposal.moderationNote,
      type: proposal.type,
      sourceText: proposal.sourceText,
      sourceUrl: proposal.sourceUrl,
      eventDate: proposal.eventDate,
      createdAt: proposal.createdAt,
      updatedAt: proposal.updatedAt,
      canEdit: this.isUserEditableStatus(proposal.editorialStatus),
      activityKeys: proposal.activities.map((item) => item.activity.key),
      translations: this.mapProposalTranslations(proposal.translations, {
        summary: true,
        context: true,
      }),
    };
  }

  private mapComment(
    comment: Prisma.CommentGetPayload<{
      include: ReturnType<ContributionsService['commentInclude']>;
    }>,
  ) {
    return {
      id: comment.id,
      text: comment.text,
      createdAt: comment.createdAt,
      activityId: comment.activityId,
      evidenceId: comment.evidenceId,
      parentCommentId: comment.parentCommentId,
      author: comment.author,
      replies: comment.replies.map((reply) => ({
        id: reply.id,
        text: reply.text,
        createdAt: reply.createdAt,
        parentCommentId: reply.parentCommentId,
        author: reply.author,
      })),
    };
  }

  private mapFollowedActivityCard(
    activity: Prisma.ActivityGetPayload<{
      include: ReturnType<ContributionsService['followedActivityInclude']>;
    }>,
    locale: LocaleCode,
    followedAt: Date,
  ) {
    const translation = this.pickTranslation(activity.translations, locale);

    return {
      id: activity.id,
      key: activity.key,
      title: translation?.title ?? activity.key,
      slug: translation?.slug ?? activity.key,
      shortDescription: translation?.shortDescription ?? null,
      editorialSummary: translation?.editorialSummary ?? null,
      granularity: activity.granularity,
      officialAiStatus: activity.officialAiStatus,
      editorialStatus: activity.editorialStatus,
      isPubliclyVisible: activity.editorialStatus === EditorialStatus.approved,
      isFollowing: true,
      followedAt,
      industries: activity.industries.map((item) => {
        const translation = this.pickTranslation(item.industry.translations, locale);
        return translation?.name ?? item.industry.key;
      }),
      categories: activity.categories.map((item) => {
        const translation = this.pickTranslation(
          item.functionalCategory.translations,
          locale,
        );
        return translation?.name ?? item.functionalCategory.key;
      }),
    };
  }

  private pickTranslation<
    T extends {
      locale: Locale;
    },
  >(translations: T[], locale: LocaleCode): T | null {
    return (
      translations.find((translation) => translation.locale === locale) ??
      translations.find((translation) => translation.locale === Locale.en) ??
      translations[0] ??
      null
    );
  }

  private resolveLocale(locale?: LocaleCode): LocaleCode {
    return locale === 'es' ? 'es' : 'en';
  }

  private mapProposalTranslations<
    T extends {
      locale: Locale;
      title: string;
      shortDescription?: string | null;
      fullDescription?: string | null;
      summary?: string | null;
      context?: string | null;
    },
  >(
    translations: T[],
    options: {
      shortDescription?: boolean;
      fullDescription?: boolean;
      summary?: boolean;
      context?: boolean;
    },
  ) {
    const en = translations.find((item) => item.locale === Locale.en);
    const es = translations.find((item) => item.locale === Locale.es);

    return {
      en: {
        title: en?.title ?? '',
        ...(options.shortDescription ? { shortDescription: en?.shortDescription ?? null } : {}),
        ...(options.fullDescription ? { fullDescription: en?.fullDescription ?? null } : {}),
        ...(options.summary ? { summary: en?.summary ?? null } : {}),
        ...(options.context ? { context: en?.context ?? null } : {}),
      },
      es: {
        title: es?.title ?? '',
        ...(options.shortDescription ? { shortDescription: es?.shortDescription ?? null } : {}),
        ...(options.fullDescription ? { fullDescription: es?.fullDescription ?? null } : {}),
        ...(options.summary ? { summary: es?.summary ?? null } : {}),
        ...(options.context ? { context: es?.context ?? null } : {}),
      },
    };
  }

  private isUserEditableStatus(status: EditorialStatus) {
    return (
      status === EditorialStatus.pending ||
      status === EditorialStatus.needs_correction
    );
  }

  private async resolveEvidenceTranslations(
    dto: Pick<
      CreateEvidenceProposalDto,
      'inputLocale' | 'translationInput' | 'translations'
    >,
  ) {
    if (dto.translations) {
      return {
        en: {
          title: dto.translations.en.title.trim(),
          summary: dto.translations.en.summary.trim(),
          context: dto.translations.en.context.trim(),
        },
        es: {
          title: dto.translations.es.title.trim(),
          summary: dto.translations.es.summary.trim(),
          context: dto.translations.es.context.trim(),
        },
      };
    }

    if (dto.inputLocale && dto.translationInput) {
      return this.translationService.buildBilingualEvidenceTranslations({
        locale: dto.inputLocale,
        title: dto.translationInput.title,
        summary: dto.translationInput.summary,
        context: dto.translationInput.context,
      });
    }

    throw contributionsErrors.evidenceTranslationRequired();
  }

  private async resolveActivityTranslations(
    dto: {
      inputLocale?: LocaleCode;
      translationInput?: {
        title: string;
        shortDescription?: string | null;
        fullDescription?: string | null;
      };
      translations?: CreateActivityProposalDto['translations'];
    },
  ) {
    if (dto.translations) {
      return {
        en: {
          title: dto.translations.en.title.trim(),
          shortDescription: dto.translations.en.shortDescription?.trim() || null,
          fullDescription: dto.translations.en.fullDescription?.trim() || null,
        },
        es: {
          title: dto.translations.es.title.trim(),
          shortDescription: dto.translations.es.shortDescription?.trim() || null,
          fullDescription: dto.translations.es.fullDescription?.trim() || null,
        },
      };
    }

    if (dto.inputLocale && dto.translationInput) {
      return this.translationService.buildBilingualActivityTranslations({
        locale: dto.inputLocale,
        title: dto.translationInput.title,
        shortDescription: dto.translationInput.shortDescription,
        fullDescription: dto.translationInput.fullDescription,
      });
    }

    throw contributionsErrors.activityTranslationRequired();
  }
}
