import {
  Injectable,
} from '@nestjs/common';
import {
  EditorialStatus,
  Locale,
  ModerationActionType,
  ModerationTargetType,
  Prisma,
} from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { EditorialActivityUpsertDto } from './dto/editorial-activity-upsert.dto';
import { EditorialCatalogActivitiesQueryDto } from './dto/editorial-catalog-activities-query.dto';
import { EditorialCatalogEvidenceQueryDto } from './dto/editorial-catalog-evidence-query.dto';
import { EditorialActivitiesQueryDto } from './dto/editorial-activities-query.dto';
import { EditorialActivitySourceDto } from './dto/editorial-activity-source.dto';
import { EditorialBulkStatusDto } from './dto/editorial-bulk-status.dto';
import { EditorialEntityStatusDto } from './dto/editorial-entity-status.dto';
import { EditorialActivityStatusDto } from './dto/editorial-activity-status.dto';
import { EditorialActivitySummaryDto } from './dto/editorial-activity-summary.dto';
import { EditorialEvidenceUpsertDto } from './dto/editorial-evidence-upsert.dto';
import { MarkEvidenceReliabilityDto } from './dto/mark-evidence-reliability.dto';
import { editorialErrors } from './editorial.errors';
import {
  applyCanonicalTaxonomyLabel,
  ensureUniqueTaxonomyItems,
  TaxonomyKind,
} from '../../shared/taxonomy-labels';

type LocaleCode = 'en' | 'es';

@Injectable()
export class EditorialService {
  constructor(private readonly prisma: PrismaService) {}

  async getCatalogReferences(localeQuery?: LocaleCode) {
    const locale = this.resolveLocale(localeQuery);

    const [industries, categories, activities] = await this.prisma.$transaction([
      this.prisma.industry.findMany({
        where: { isActive: true },
        include: { translations: true },
      }),
      this.prisma.functionalCategory.findMany({
        where: { isActive: true },
        include: { translations: true },
      }),
      this.prisma.activity.findMany({
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        include: { translations: true },
      }),
    ]);

    const localeTag = locale === 'es' ? 'es-AR' : 'en-US';

    return {
      industries: ensureUniqueTaxonomyItems(
        'industry',
        locale,
        industries.map((item) =>
          this.mapNamedTranslation('industry', item.translations, locale, item.key),
        ),
      )
        .sort((left, right) =>
          left.name.localeCompare(right.name, localeTag, {
            sensitivity: 'base',
            ignorePunctuation: true,
          }),
        ),
      categories: ensureUniqueTaxonomyItems(
        'category',
        locale,
        categories.map((item) =>
          this.mapNamedTranslation('category', item.translations, locale, item.key),
        ),
      )
        .sort((left, right) =>
          left.name.localeCompare(right.name, localeTag, {
            sensitivity: 'base',
            ignorePunctuation: true,
          }),
        ),
      activities: activities
        .map((item) => {
          const translation = this.pickTranslation(item.translations, locale);
          return {
            id: item.id,
            key: item.key,
            title: translation?.title ?? item.key,
            slug: translation?.slug ?? item.key,
            editorialStatus: item.editorialStatus,
          };
        })
        .sort((left, right) =>
          left.title.localeCompare(right.title, localeTag, {
            sensitivity: 'base',
            ignorePunctuation: true,
          }),
        ),
    };
  }

  async listActivities(query: EditorialActivitiesQueryDto) {
    const locale = this.resolveLocale(query.locale);
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where = this.buildActivityWhere(query, locale);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.activity.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
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
          evidenceLinks: true,
          editorialHistory: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.activity.count({ where }),
    ]);

    return {
      items: items.map((activity) => {
        const translation = this.pickTranslation(activity.translations, locale);
        const hasEditorialSummary = Boolean(translation?.editorialSummary?.trim());

        return {
          id: activity.id,
          key: activity.key,
          title: translation?.title ?? activity.key,
          slug: translation?.slug ?? activity.key,
          editorialStatus: activity.editorialStatus,
          officialAiStatus: activity.officialAiStatus,
          hasEditorialSummary,
          evidenceCount: activity.evidenceLinks.length,
          industryKeys: activity.industries.map((item) => item.industry.key),
          categoryKeys: activity.categories.map((item) => item.functionalCategory.key),
          industryNames: activity.industries.map((item) =>
            this.mapNamedTranslation('industry', item.industry.translations, locale, item.industry.key),
          ),
          categoryNames: activity.categories.map((item) =>
            this.mapNamedTranslation(
              'category',
              item.functionalCategory.translations,
              locale,
              item.functionalCategory.key,
            ),
          ),
          completionSignals: {
            hasEditorialSummaryEn: Boolean(
              activity.translations.find((item) => item.locale === Locale.en)?.editorialSummary?.trim(),
            ),
            hasEditorialSummaryEs: Boolean(
              activity.translations.find((item) => item.locale === Locale.es)?.editorialSummary?.trim(),
            ),
            hasEvidence: activity.evidenceLinks.length > 0,
          },
          lastEditorialActionAt: activity.editorialHistory[0]?.createdAt ?? null,
          updatedAt: activity.updatedAt,
        };
      }),
      total,
      page,
      pageSize,
    };
  }

  async getActivityDetail(
    activityId: string,
    localeQuery?: LocaleCode,
    navigationStatus?: EditorialStatus,
  ) {
    const locale = this.resolveLocale(localeQuery);

    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
      include: {
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
        evidenceLinks: {
          include: {
            evidence: {
              include: {
                translations: true,
              },
            },
          },
        },
        editorialHistory: {
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

    if (!activity) {
      throw editorialErrors.activityNotFound();
    }

    const translation = this.pickTranslation(activity.translations, locale);
    const laneStatus = navigationStatus ?? EditorialStatus.pending;
    const navigation = await this.buildReviewNavigation(activityId, laneStatus);

    return {
      id: activity.id,
      key: activity.key,
      granularity: activity.granularity,
      editorialStatus: activity.editorialStatus,
      officialAiStatus: activity.officialAiStatus,
      translations: this.mapActivityTranslations(activity.translations),
      title: translation?.title ?? activity.key,
      slug: translation?.slug ?? activity.key,
      industries: activity.industries.map((item) =>
        this.mapNamedTranslation('industry', item.industry.translations, locale, item.industry.key),
      ),
      categories: activity.categories.map((item) =>
        this.mapNamedTranslation(
          'category',
          item.functionalCategory.translations,
          locale,
          item.functionalCategory.key,
        ),
      ),
      evidences: activity.evidenceLinks.map((item) => {
        const evidenceTranslation = this.pickTranslation(item.evidence.translations, locale);
        return {
          id: item.evidence.id,
          editorialStatus: item.evidence.editorialStatus,
          reliabilityFlag: item.evidence.reliabilityFlag,
          title: evidenceTranslation?.title ?? item.evidence.type,
          slug: evidenceTranslation?.slug ?? null,
          summary: evidenceTranslation?.summary ?? null,
        };
      }),
      completionSignals: {
        hasEditorialSummaryEn: Boolean(
          activity.translations.find((item) => item.locale === Locale.en)?.editorialSummary?.trim(),
        ),
        hasEditorialSummaryEs: Boolean(
          activity.translations.find((item) => item.locale === Locale.es)?.editorialSummary?.trim(),
        ),
        hasEvidence: activity.evidenceLinks.length > 0,
      },
      reviewNavigation: navigation,
      editorialHistory: activity.editorialHistory.map((entry) => ({
        id: entry.id,
        previousOfficialAiStatus: entry.previousOfficialAiStatus,
        newOfficialAiStatus: entry.newOfficialAiStatus,
        previousEditorialStatus: entry.previousEditorialStatus,
        newEditorialStatus: entry.newEditorialStatus,
        rationale: entry.rationale,
        createdAt: entry.createdAt,
        actor: entry.actor,
      })),
    };
  }

  async listCatalogActivities(query: EditorialCatalogActivitiesQueryDto) {
    const locale = this.resolveLocale(query.locale);
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where = this.buildCatalogActivityWhere(query);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.activity.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          translations: true,
          industries: {
            include: {
              industry: { include: { translations: true } },
            },
          },
          categories: {
            include: {
              functionalCategory: { include: { translations: true } },
            },
          },
          evidenceLinks: {
            select: { id: true },
          },
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
          slug: translation?.slug ?? activity.key,
          granularity: activity.granularity,
          editorialStatus: activity.editorialStatus,
          officialAiStatus: activity.officialAiStatus,
          evidenceCount: activity.evidenceLinks.length,
          industryNames: activity.industries.map((item) =>
            this.mapNamedTranslation(
              'industry',
              item.industry.translations,
              locale,
              item.industry.key,
            ).name,
          ),
          categoryNames: activity.categories.map((item) =>
            this.mapNamedTranslation(
              'category',
              item.functionalCategory.translations,
              locale,
              item.functionalCategory.key,
            ).name,
          ),
          updatedAt: activity.updatedAt,
        };
      }),
      total,
      page,
      pageSize,
    };
  }

  async getCatalogActivity(activityId: string, localeQuery?: LocaleCode) {
    const locale = this.resolveLocale(localeQuery);
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        translations: true,
        industries: {
          include: {
            industry: { include: { translations: true } },
          },
        },
        categories: {
          include: {
            functionalCategory: { include: { translations: true } },
          },
        },
        evidenceLinks: {
          include: {
            evidence: {
              include: {
                translations: true,
              },
            },
          },
        },
      },
    });

    if (!activity) {
      throw editorialErrors.activityNotFound();
    }

    const translation = this.pickTranslation(activity.translations, locale);

    return {
      id: activity.id,
      key: activity.key,
      title: translation?.title ?? activity.key,
      slug: translation?.slug ?? activity.key,
      granularity: activity.granularity,
      editorialStatus: activity.editorialStatus,
      officialAiStatus: activity.officialAiStatus,
      translations: this.mapActivityTranslations(activity.translations),
      industries: activity.industries.map((item) =>
        this.mapNamedTranslation('industry', item.industry.translations, locale, item.industry.key),
      ),
      categories: activity.categories.map((item) =>
        this.mapNamedTranslation(
          'category',
          item.functionalCategory.translations,
          locale,
          item.functionalCategory.key,
        ),
      ),
      industryKeys: activity.industries.map((item) => item.industry.key),
      categoryKeys: activity.categories.map((item) => item.functionalCategory.key),
      evidences: activity.evidenceLinks.map((item) => {
        const evidenceTranslation = this.pickTranslation(item.evidence.translations, locale);
        return {
          id: item.evidence.id,
          key: item.evidence.key,
          title: evidenceTranslation?.title ?? item.evidence.type,
          slug: evidenceTranslation?.slug ?? null,
          editorialStatus: item.evidence.editorialStatus,
        };
      }),
      updatedAt: activity.updatedAt,
    };
  }

  async createCatalogActivity(actorUserId: string, dto: EditorialActivityUpsertDto) {
    return this.persistCatalogActivity(actorUserId, dto);
  }

  async updateCatalogActivity(
    actorUserId: string,
    activityId: string,
    dto: EditorialActivityUpsertDto,
  ) {
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw editorialErrors.activityNotFound();
    }

    return this.persistCatalogActivity(actorUserId, dto, activity.id);
  }

  async updateCatalogActivityEditorialStatus(
    actorUserId: string,
    activityId: string,
    dto: EditorialEntityStatusDto,
  ) {
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw editorialErrors.activityNotFound();
    }

    const rationale = dto.rationale?.trim() || `Activity marked as ${dto.editorialStatus}.`;

    const updated = await this.prisma.$transaction(async (tx) => {
      const entity = await tx.activity.update({
        where: { id: activityId },
        data: { editorialStatus: dto.editorialStatus },
      });

      await tx.editorialActivityStatusHistory.create({
        data: {
          activityId,
          actorUserId,
          previousOfficialAiStatus: activity.officialAiStatus,
          newOfficialAiStatus: activity.officialAiStatus,
          previousEditorialStatus: activity.editorialStatus,
          newEditorialStatus: dto.editorialStatus,
          rationale,
        },
      });

      await tx.moderationAction.create({
        data: {
          actorUserId,
          targetType: ModerationTargetType.activity,
          targetId: activityId,
          actionType: this.mapStatusToModerationAction(dto.editorialStatus),
          reason: rationale,
        },
      });

      return entity;
    });

    return {
      id: updated.id,
      editorialStatus: updated.editorialStatus,
    };
  }

  async updateActivityStatus(
    actorUserId: string,
    activityId: string,
    dto: EditorialActivityStatusDto,
  ) {
    const rationale = dto.rationale.trim();
    if (!rationale) {
      throw editorialErrors.editorialRationaleRequired();
    }

    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw editorialErrors.activityNotFound();
    }

    const nextEditorialStatus = dto.editorialStatus ?? activity.editorialStatus;

    const updated = await this.prisma.$transaction(async (tx) => {
      const entity = await tx.activity.update({
        where: { id: activityId },
        data: {
          officialAiStatus: dto.officialAiStatus,
          editorialStatus: nextEditorialStatus,
        },
      });

      await tx.editorialActivityStatusHistory.create({
        data: {
          activityId,
          actorUserId,
          previousOfficialAiStatus: activity.officialAiStatus,
          newOfficialAiStatus: dto.officialAiStatus,
          previousEditorialStatus: activity.editorialStatus,
          newEditorialStatus: nextEditorialStatus,
          rationale,
        },
      });

      return entity;
    });

    return {
      id: updated.id,
      editorialStatus: updated.editorialStatus,
      officialAiStatus: updated.officialAiStatus,
    };
  }

  async bulkUpdateActivityStatus(
    actorUserId: string,
    dto: EditorialBulkStatusDto,
  ) {
    const rationale = dto.rationale.trim();
    if (!rationale) {
      throw editorialErrors.editorialRationaleRequired();
    }

    const activities = await this.prisma.activity.findMany({
      where: {
        id: {
          in: dto.ids,
        },
      },
      include: {
        translations: true,
        evidenceLinks: {
          select: {
            id: true,
          },
        },
      },
    });

    const activityMap = new Map(activities.map((activity) => [activity.id, activity]));
    const results = dto.ids.map((id) => {
      const activity = activityMap.get(id);

      if (!activity) {
        return {
          id,
          key: null,
          result: 'not_found' as const,
          reason: 'Activity not found.',
        };
      }

      const effectiveOfficialAiStatus =
        typeof dto.officialAiStatus === 'number'
          ? dto.officialAiStatus
          : activity.officialAiStatus;
      const readinessError = this.validateBulkTransition(
        activity,
        dto.editorialStatus,
        effectiveOfficialAiStatus,
      );

      if (readinessError) {
        return {
          id: activity.id,
          key: activity.key,
          result: 'skipped' as const,
          previousEditorialStatus: activity.editorialStatus,
          previousOfficialAiStatus: activity.officialAiStatus,
          reason: readinessError,
        };
      }

      const nextEditorialStatus = dto.editorialStatus;
      const nextOfficialAiStatus = effectiveOfficialAiStatus;
      const hasStatusChange = activity.editorialStatus !== nextEditorialStatus;
      const hasOfficialStatusChange =
        activity.officialAiStatus !== nextOfficialAiStatus;

      if (!hasStatusChange && !hasOfficialStatusChange) {
        return {
          id: activity.id,
          key: activity.key,
          result: 'skipped' as const,
          previousEditorialStatus: activity.editorialStatus,
          previousOfficialAiStatus: activity.officialAiStatus,
          reason: 'Activity already matches the requested editorial decision.',
        };
      }

      return {
        id: activity.id,
        key: activity.key,
        result: 'ready' as const,
        previousEditorialStatus: activity.editorialStatus,
        previousOfficialAiStatus: activity.officialAiStatus,
        nextEditorialStatus,
        nextOfficialAiStatus,
      };
    });

    const readyItems = results.filter((item) => item.result === 'ready');

    if (readyItems.length > 0) {
      await this.prisma.$transaction(async (tx) => {
        for (const item of readyItems) {
          await tx.activity.update({
            where: { id: item.id },
            data: {
              editorialStatus: item.nextEditorialStatus,
              officialAiStatus: item.nextOfficialAiStatus,
            },
          });

          await tx.editorialActivityStatusHistory.create({
            data: {
              activityId: item.id,
              actorUserId,
              previousOfficialAiStatus: item.previousOfficialAiStatus,
              newOfficialAiStatus: item.nextOfficialAiStatus,
              previousEditorialStatus: item.previousEditorialStatus,
              newEditorialStatus: item.nextEditorialStatus,
              rationale,
            },
          });
        }
      });
    }

    return {
      requestedCount: dto.ids.length,
      processedCount: readyItems.length,
      skippedCount: results.filter((item) => item.result === 'skipped').length,
      notFoundCount: results.filter((item) => item.result === 'not_found').length,
      editorialStatus: dto.editorialStatus,
      officialAiStatusApplied:
        typeof dto.officialAiStatus === 'number' ? dto.officialAiStatus : null,
      results: results.map((item) => {
        if (item.result === 'ready') {
          return {
            id: item.id,
            key: item.key,
            result: 'updated' as const,
            previousEditorialStatus: item.previousEditorialStatus,
            newEditorialStatus: item.nextEditorialStatus,
            previousOfficialAiStatus: item.previousOfficialAiStatus,
            newOfficialAiStatus: item.nextOfficialAiStatus,
            reason: null,
          };
        }

        return {
          id: item.id,
          key: item.key,
          result: item.result,
          previousEditorialStatus:
            'previousEditorialStatus' in item ? item.previousEditorialStatus : null,
          newEditorialStatus: null,
          previousOfficialAiStatus:
            'previousOfficialAiStatus' in item ? item.previousOfficialAiStatus : null,
          newOfficialAiStatus: null,
          reason: item.reason,
        };
      }),
    };
  }

  async updateActivitySummary(
    actorUserId: string,
    activityId: string,
    dto: EditorialActivitySummaryDto,
  ) {
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw editorialErrors.activityNotFound();
    }

    await this.prisma.$transaction(async (tx) => {
      await Promise.all([
        tx.activityTranslation.update({
          where: {
            activityId_locale: {
              activityId,
              locale: Locale.en,
            },
          },
          data: {
            editorialSummary: dto.translations.en.editorialSummary.trim(),
          },
        }),
        tx.activityTranslation.update({
          where: {
            activityId_locale: {
              activityId,
              locale: Locale.es,
            },
          },
          data: {
            editorialSummary: dto.translations.es.editorialSummary.trim(),
          },
        }),
      ]);

      await tx.moderationAction.create({
        data: {
          actorUserId,
          targetType: ModerationTargetType.activity,
          targetId: activityId,
          actionType: ModerationActionType.update_summary,
          reason: 'Editorial summary updated.',
          metadataJson: {
            en: dto.translations.en.editorialSummary.trim(),
            es: dto.translations.es.editorialSummary.trim(),
          },
        },
      });
    });

    return this.getActivityDetail(activityId, 'en');
  }

  async updateActivitySource(
    actorUserId: string,
    activityId: string,
    dto: EditorialActivitySourceDto,
  ) {
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw editorialErrors.activityNotFound();
    }

    const enTitle = dto.translations.en.title.trim();
    const esTitle = dto.translations.es.title.trim();
    const enSlug = dto.translations.en.slug.trim();
    const esSlug = dto.translations.es.slug.trim();

    if (!enTitle || !esTitle) {
      throw editorialErrors.bilingualTitlesRequired();
    }

    if (!enSlug || !esSlug) {
      throw editorialErrors.bilingualSlugsRequired();
    }

    const enShortDescription = dto.translations.en.shortDescription?.trim() || null;
    const esShortDescription = dto.translations.es.shortDescription?.trim() || null;
    const enFullDescription = dto.translations.en.fullDescription?.trim() || null;
    const esFullDescription = dto.translations.es.fullDescription?.trim() || null;

    try {
      await this.prisma.$transaction(async (tx) => {
        await Promise.all([
          tx.activityTranslation.update({
            where: {
              activityId_locale: {
                activityId,
                locale: Locale.en,
              },
            },
            data: {
              title: enTitle,
              shortDescription: enShortDescription,
              fullDescription: enFullDescription,
              slug: enSlug,
              seoTitle: enTitle,
              seoDescription: enShortDescription ?? enFullDescription,
            },
          }),
          tx.activityTranslation.update({
            where: {
              activityId_locale: {
                activityId,
                locale: Locale.es,
              },
            },
            data: {
              title: esTitle,
              shortDescription: esShortDescription,
              fullDescription: esFullDescription,
              slug: esSlug,
              seoTitle: esTitle,
              seoDescription: esShortDescription ?? esFullDescription,
            },
          }),
        ]);

        await tx.moderationAction.create({
          data: {
            actorUserId,
            targetType: ModerationTargetType.activity,
            targetId: activityId,
            actionType: ModerationActionType.update_summary,
            reason: 'Activity source content updated.',
            metadataJson: {
              sourceContent: {
                en: {
                  title: enTitle,
                  shortDescription: enShortDescription,
                  fullDescription: enFullDescription,
                  slug: enSlug,
                },
                es: {
                  title: esTitle,
                  shortDescription: esShortDescription,
                  fullDescription: esFullDescription,
                  slug: esSlug,
                },
              },
            },
          },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw editorialErrors.activitySlugInUse();
      }

      throw error;
    }

    return this.getActivityDetail(activityId, 'en');
  }

  async markEvidenceReliability(
    actorUserId: string,
    evidenceId: string,
    dto: MarkEvidenceReliabilityDto,
  ) {
    const reason = dto.reason.trim();
    if (!reason) {
      throw editorialErrors.reliabilityRationaleRequired();
    }

    const evidence = await this.prisma.evidence.findUnique({
      where: { id: evidenceId },
    });
    if (!evidence) {
      throw editorialErrors.evidenceNotFound();
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const entity = await tx.evidence.update({
        where: { id: evidenceId },
        data: {
          reliabilityFlag: dto.flag,
        },
      });

      await tx.moderationAction.create({
        data: {
          actorUserId,
          targetType: ModerationTargetType.evidence,
          targetId: evidenceId,
          actionType: ModerationActionType.mark_reliability,
          reason,
          evidenceId,
          metadataJson: {
            previousFlag: evidence.reliabilityFlag,
            newFlag: dto.flag,
          },
        },
      });

      return entity;
    });

    return {
      id: updated.id,
      reliabilityFlag: updated.reliabilityFlag,
    };
  }

  async listCatalogEvidence(query: EditorialCatalogEvidenceQueryDto) {
    const locale = this.resolveLocale(query.locale);
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where = this.buildCatalogEvidenceWhere(query);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.evidence.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          translations: true,
          activities: {
            include: {
              activity: { include: { translations: true } },
            },
          },
        },
      }),
      this.prisma.evidence.count({ where }),
    ]);

    return {
      items: items.map((evidence) => {
        const translation = this.pickTranslation(evidence.translations, locale);
        return {
          id: evidence.id,
          key: evidence.key,
          title: translation?.title ?? evidence.type,
          slug: translation?.slug ?? evidence.id,
          type: evidence.type,
          editorialStatus: evidence.editorialStatus,
          reliabilityFlag: evidence.reliabilityFlag,
          eventDate: evidence.eventDate,
          activityCount: evidence.activities.length,
          activityTitles: evidence.activities.map((item) => {
            const activityTranslation = this.pickTranslation(item.activity.translations, locale);
            return activityTranslation?.title ?? item.activity.key;
          }),
          updatedAt: evidence.updatedAt,
        };
      }),
      total,
      page,
      pageSize,
    };
  }

  async getCatalogEvidence(evidenceId: string, localeQuery?: LocaleCode) {
    const locale = this.resolveLocale(localeQuery);
    const evidence = await this.prisma.evidence.findUnique({
      where: { id: evidenceId },
      include: {
        translations: true,
        activities: {
          include: {
            activity: { include: { translations: true } },
          },
        },
      },
    });

    if (!evidence) {
      throw editorialErrors.evidenceNotFound();
    }

    const translation = this.pickTranslation(evidence.translations, locale);

    return {
      id: evidence.id,
      key: evidence.key,
      title: translation?.title ?? evidence.type,
      slug: translation?.slug ?? evidence.id,
      type: evidence.type,
      editorialStatus: evidence.editorialStatus,
      reliabilityFlag: evidence.reliabilityFlag,
      sourceText: evidence.sourceText,
      sourceUrl: evidence.sourceUrl,
      eventDate: evidence.eventDate,
      activityIds: evidence.activities.map((item) => item.activityId),
      activities: evidence.activities.map((item) => {
        const activityTranslation = this.pickTranslation(item.activity.translations, locale);
        return {
          id: item.activity.id,
          key: item.activity.key,
          title: activityTranslation?.title ?? item.activity.key,
          slug: activityTranslation?.slug ?? item.activity.key,
          editorialStatus: item.activity.editorialStatus,
        };
      }),
      translations: this.mapEvidenceTranslations(evidence.translations),
      updatedAt: evidence.updatedAt,
    };
  }

  async createCatalogEvidence(actorUserId: string, dto: EditorialEvidenceUpsertDto) {
    return this.persistCatalogEvidence(actorUserId, dto);
  }

  async updateCatalogEvidence(
    actorUserId: string,
    evidenceId: string,
    dto: EditorialEvidenceUpsertDto,
  ) {
    const evidence = await this.prisma.evidence.findUnique({
      where: { id: evidenceId },
    });

    if (!evidence) {
      throw editorialErrors.evidenceNotFound();
    }

    return this.persistCatalogEvidence(actorUserId, dto, evidence.id);
  }

  async updateCatalogEvidenceEditorialStatus(
    actorUserId: string,
    evidenceId: string,
    dto: EditorialEntityStatusDto,
  ) {
    const evidence = await this.prisma.evidence.findUnique({
      where: { id: evidenceId },
    });

    if (!evidence) {
      throw editorialErrors.evidenceNotFound();
    }

    const rationale = dto.rationale?.trim() || `Evidence marked as ${dto.editorialStatus}.`;

    const updated = await this.prisma.$transaction(async (tx) => {
      const entity = await tx.evidence.update({
        where: { id: evidenceId },
        data: { editorialStatus: dto.editorialStatus },
      });

      await tx.moderationAction.create({
        data: {
          actorUserId,
          targetType: ModerationTargetType.evidence,
          targetId: evidenceId,
          evidenceId,
          actionType: this.mapStatusToModerationAction(dto.editorialStatus),
          reason: rationale,
        },
      });

      return entity;
    });

    return {
      id: updated.id,
      editorialStatus: updated.editorialStatus,
    };
  }

  private async persistCatalogActivity(
    actorUserId: string,
    dto: EditorialActivityUpsertDto,
    activityId?: string,
  ) {
    const enTitle = dto.translations.en.title.trim();
    const esTitle = dto.translations.es.title.trim();
    const enSlugInput = dto.translations.en.slug.trim();
    const esSlugInput = dto.translations.es.slug.trim();

    if (!enTitle || !esTitle) {
      throw editorialErrors.bilingualTitlesRequired();
    }

    if (!enSlugInput || !esSlugInput) {
      throw editorialErrors.bilingualSlugsRequired();
    }

    const distinctIndustryKeys = Array.from(new Set(dto.industryKeys));
    const distinctCategoryKeys = Array.from(new Set(dto.categoryKeys));
    const industries = await this.prisma.industry.findMany({
      where: { key: { in: distinctIndustryKeys } },
    });
    if (industries.length !== distinctIndustryKeys.length) {
      throw editorialErrors.invalidIndustries();
    }

    const categories = await this.prisma.functionalCategory.findMany({
      where: { key: { in: distinctCategoryKeys } },
    });
    if (categories.length !== distinctCategoryKeys.length) {
      throw editorialErrors.invalidCategories();
    }

    try {
      const savedId = await this.prisma.$transaction(async (tx) => {
        const enSlug = await this.ensureUniqueActivitySlug(tx, Locale.en, enSlugInput, activityId);
        const esSlug = await this.ensureUniqueActivitySlug(tx, Locale.es, esSlugInput, activityId);

        if (activityId) {
          await tx.activity.update({
            where: { id: activityId },
            data: {
              granularity: dto.granularity,
              officialAiStatus:
                typeof dto.officialAiStatus === 'number' ? dto.officialAiStatus : null,
              editorialStatus: dto.editorialStatus ?? EditorialStatus.pending,
              translations: {
                updateMany: [
                  {
                    where: { locale: Locale.en },
                    data: {
                      title: enTitle,
                      shortDescription: dto.translations.en.shortDescription?.trim() || null,
                      fullDescription: dto.translations.en.fullDescription?.trim() || null,
                      editorialSummary: dto.translations.en.editorialSummary?.trim() || null,
                      slug: enSlug,
                      seoTitle: enTitle,
                      seoDescription:
                        dto.translations.en.shortDescription?.trim() ||
                        dto.translations.en.fullDescription?.trim() ||
                        null,
                    },
                  },
                  {
                    where: { locale: Locale.es },
                    data: {
                      title: esTitle,
                      shortDescription: dto.translations.es.shortDescription?.trim() || null,
                      fullDescription: dto.translations.es.fullDescription?.trim() || null,
                      editorialSummary: dto.translations.es.editorialSummary?.trim() || null,
                      slug: esSlug,
                      seoTitle: esTitle,
                      seoDescription:
                        dto.translations.es.shortDescription?.trim() ||
                        dto.translations.es.fullDescription?.trim() ||
                        null,
                    },
                  },
                ],
              },
            },
          });

          await tx.activityIndustry.deleteMany({ where: { activityId } });
          await tx.activityIndustry.createMany({
            data: industries.map((item) => ({ activityId, industryId: item.id })),
          });

          await tx.activityCategory.deleteMany({ where: { activityId } });
          await tx.activityCategory.createMany({
            data: categories.map((item) => ({
              activityId,
              functionalCategoryId: item.id,
            })),
          });

          await tx.moderationAction.create({
            data: {
              actorUserId,
              targetType: ModerationTargetType.activity,
              targetId: activityId,
              actionType: ModerationActionType.update_summary,
              reason: 'Activity updated from backoffice CRUD.',
            },
          });

          return activityId;
        }

        const key = await this.ensureUniqueActivityKey(
          tx,
          this.slugifyValue(enTitle || esTitle) || 'activity',
        );
        const created = await tx.activity.create({
          data: {
            key,
            granularity: dto.granularity,
            officialAiStatus:
              typeof dto.officialAiStatus === 'number' ? dto.officialAiStatus : null,
            editorialStatus: dto.editorialStatus ?? EditorialStatus.pending,
            translations: {
              create: [
                {
                  locale: Locale.en,
                  title: enTitle,
                  shortDescription: dto.translations.en.shortDescription?.trim() || null,
                  fullDescription: dto.translations.en.fullDescription?.trim() || null,
                  editorialSummary: dto.translations.en.editorialSummary?.trim() || null,
                  slug: enSlug,
                  seoTitle: enTitle,
                  seoDescription:
                    dto.translations.en.shortDescription?.trim() ||
                    dto.translations.en.fullDescription?.trim() ||
                    null,
                },
                {
                  locale: Locale.es,
                  title: esTitle,
                  shortDescription: dto.translations.es.shortDescription?.trim() || null,
                  fullDescription: dto.translations.es.fullDescription?.trim() || null,
                  editorialSummary: dto.translations.es.editorialSummary?.trim() || null,
                  slug: esSlug,
                  seoTitle: esTitle,
                  seoDescription:
                    dto.translations.es.shortDescription?.trim() ||
                    dto.translations.es.fullDescription?.trim() ||
                    null,
                },
              ],
            },
            industries: { create: industries.map((item) => ({ industryId: item.id })) },
            categories: {
              create: categories.map((item) => ({ functionalCategoryId: item.id })),
            },
          },
        });

        await tx.editorialActivityStatusHistory.create({
          data: {
            activityId: created.id,
            actorUserId,
            previousOfficialAiStatus: null,
            newOfficialAiStatus:
              typeof dto.officialAiStatus === 'number' ? dto.officialAiStatus : null,
            previousEditorialStatus: null,
            newEditorialStatus: dto.editorialStatus ?? EditorialStatus.pending,
            rationale: 'Activity created from backoffice CRUD.',
          },
        });

        await tx.moderationAction.create({
          data: {
            actorUserId,
            targetType: ModerationTargetType.activity,
            targetId: created.id,
            actionType: ModerationActionType.update_summary,
            reason: 'Activity created from backoffice CRUD.',
          },
        });

        return created.id;
      });

      return this.getCatalogActivity(savedId, 'en');
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw editorialErrors.activitySlugInUse();
      }

      throw error;
    }
  }

  private async persistCatalogEvidence(
    actorUserId: string,
    dto: EditorialEvidenceUpsertDto,
    evidenceId?: string,
  ) {
    const enTitle = dto.translations.en.title.trim();
    const esTitle = dto.translations.es.title.trim();
    const enSummary = dto.translations.en.summary.trim();
    const esSummary = dto.translations.es.summary.trim();
    const enContext = dto.translations.en.context.trim();
    const esContext = dto.translations.es.context.trim();
    const enSlugInput = dto.translations.en.slug.trim();
    const esSlugInput = dto.translations.es.slug.trim();
    const sourceText = dto.sourceText.trim();

    if (!enTitle || !esTitle || !enSummary || !esSummary || !enContext || !esContext) {
      throw editorialErrors.bilingualEvidenceContentRequired();
    }

    if (!enSlugInput || !esSlugInput) {
      throw editorialErrors.bilingualSlugsRequired();
    }

    if (!sourceText) {
      throw editorialErrors.sourceTextRequired();
    }

    const distinctActivityIds = Array.from(new Set(dto.activityIds));
    const activities = distinctActivityIds.length
      ? await this.prisma.activity.findMany({
          where: { id: { in: distinctActivityIds } },
        })
      : [];

    if (activities.length !== distinctActivityIds.length) {
      throw editorialErrors.invalidRelatedActivities();
    }

    try {
      const savedId = await this.prisma.$transaction(async (tx) => {
        const enSlug = await this.ensureUniqueEvidenceSlug(tx, Locale.en, enSlugInput, evidenceId);
        const esSlug = await this.ensureUniqueEvidenceSlug(tx, Locale.es, esSlugInput, evidenceId);
        const eventDate = dto.eventDate ? new Date(dto.eventDate) : null;

        if (evidenceId) {
          await tx.evidence.update({
            where: { id: evidenceId },
            data: {
              editorialStatus: dto.editorialStatus ?? EditorialStatus.pending,
              type: dto.type.trim(),
              sourceText,
              sourceUrl: dto.sourceUrl?.trim() || null,
              eventDate,
              reliabilityFlag: dto.reliabilityFlag,
              translations: {
                updateMany: [
                  {
                    where: { locale: Locale.en },
                    data: {
                      title: enTitle,
                      summary: enSummary,
                      context: enContext,
                      slug: enSlug,
                    },
                  },
                  {
                    where: { locale: Locale.es },
                    data: {
                      title: esTitle,
                      summary: esSummary,
                      context: esContext,
                      slug: esSlug,
                    },
                  },
                ],
              },
            },
          });

          await tx.evidenceActivity.deleteMany({ where: { evidenceId } });
          if (activities.length) {
            await tx.evidenceActivity.createMany({
              data: activities.map((item) => ({ evidenceId, activityId: item.id })),
            });
          }

          await tx.moderationAction.create({
            data: {
              actorUserId,
              targetType: ModerationTargetType.evidence,
              targetId: evidenceId,
              evidenceId,
              actionType: ModerationActionType.update_summary,
              reason: 'Evidence updated from backoffice CRUD.',
            },
          });

          return evidenceId;
        }

        const key = await this.ensureUniqueEvidenceKey(
          tx,
          [this.slugifyValue(enTitle || esTitle), dto.eventDate ?? null]
            .filter(Boolean)
            .join('-') || 'evidence',
        );

        const created = await tx.evidence.create({
          data: {
            key,
            editorialStatus: dto.editorialStatus ?? EditorialStatus.pending,
            type: dto.type.trim(),
            sourceText,
            sourceUrl: dto.sourceUrl?.trim() || null,
            eventDate,
            reliabilityFlag: dto.reliabilityFlag,
            translations: {
              create: [
                {
                  locale: Locale.en,
                  title: enTitle,
                  summary: enSummary,
                  context: enContext,
                  slug: enSlug,
                },
                {
                  locale: Locale.es,
                  title: esTitle,
                  summary: esSummary,
                  context: esContext,
                  slug: esSlug,
                },
              ],
            },
            activities: {
              create: activities.map((item) => ({ activityId: item.id })),
            },
          },
        });

        await tx.moderationAction.create({
          data: {
            actorUserId,
            targetType: ModerationTargetType.evidence,
            targetId: created.id,
            evidenceId: created.id,
            actionType: ModerationActionType.update_summary,
            reason: 'Evidence created from backoffice CRUD.',
          },
        });

        return created.id;
      });

      return this.getCatalogEvidence(savedId, 'en');
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw editorialErrors.evidenceSlugInUse();
      }

      throw error;
    }
  }

  private buildActivityWhere(
    query: EditorialActivitiesQueryDto,
    locale: LocaleCode,
  ): Prisma.ActivityWhereInput {
    const where: Prisma.ActivityWhereInput = {};
    const andClauses: Prisma.ActivityWhereInput[] = [];
    const localeValue = locale === 'es' ? Locale.es : Locale.en;

    if (query.status) {
      where.editorialStatus = query.status;
    }

    if (typeof query.officialAiStatus === 'number') {
      where.officialAiStatus = query.officialAiStatus;
    }

    if (typeof query.hasEvidence === 'boolean') {
      where.evidenceLinks = query.hasEvidence ? { some: {} } : { none: {} };
    }

    if (typeof query.hasEditorialSummary === 'boolean') {
      if (query.hasEditorialSummary) {
        andClauses.push({
          translations: {
            some: {
              locale: localeValue,
              editorialSummary: {
                not: null,
                notIn: [''],
              },
            },
          },
        });
      } else {
        andClauses.push({
          OR: [
            {
              translations: {
                none: {
                  locale: localeValue,
                  editorialSummary: {
                    not: null,
                  },
                },
              },
            },
            {
              translations: {
                some: {
                  locale: localeValue,
                  editorialSummary: '',
                },
              },
            },
          ],
        });
      }
    }

    if (query.q?.trim()) {
      const term = query.q.trim();
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
                  { slug: { contains: term, mode: 'insensitive' } },
                ],
              },
            },
          },
        ],
      });
    }

    if (query.industry?.trim()) {
      const term = query.industry.trim();
      where.industries = {
        some: {
          OR: [
            { industry: { key: term } },
            {
              industry: {
                translations: {
                  some: {
                    OR: [
                      { slug: { equals: term, mode: 'insensitive' } },
                      { name: { contains: term, mode: 'insensitive' } },
                    ],
                  },
                },
              },
            },
          ],
        },
      };
    }

    if (query.category?.trim()) {
      const term = query.category.trim();
      where.categories = {
        some: {
          OR: [
            { functionalCategory: { key: term } },
            {
              functionalCategory: {
                translations: {
                  some: {
                    OR: [
                      { slug: { equals: term, mode: 'insensitive' } },
                      { name: { contains: term, mode: 'insensitive' } },
                    ],
                  },
                },
              },
            },
          ],
        },
      };
    }

    if (andClauses.length > 0) {
      where.AND = andClauses;
    }

    return where;
  }

  private buildCatalogActivityWhere(
    query: EditorialCatalogActivitiesQueryDto,
  ): Prisma.ActivityWhereInput {
    const where: Prisma.ActivityWhereInput = {};
    const andClauses: Prisma.ActivityWhereInput[] = [];

    if (query.status) {
      where.editorialStatus = query.status;
    }

    if (query.granularity) {
      where.granularity = query.granularity;
    }

    if (typeof query.officialAiStatus === 'number') {
      where.officialAiStatus = query.officialAiStatus;
    }

    if (query.q?.trim()) {
      const term = query.q.trim();
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
                  { slug: { contains: term, mode: 'insensitive' } },
                ],
              },
            },
          },
        ],
      });
    }

    if (query.industry?.trim()) {
      const term = query.industry.trim();
      where.industries = {
        some: {
          OR: [
            { industry: { key: term } },
            {
              industry: {
                translations: {
                  some: {
                    OR: [
                      { slug: { equals: term, mode: 'insensitive' } },
                      { name: { contains: term, mode: 'insensitive' } },
                    ],
                  },
                },
              },
            },
          ],
        },
      };
    }

    if (query.category?.trim()) {
      const term = query.category.trim();
      where.categories = {
        some: {
          OR: [
            { functionalCategory: { key: term } },
            {
              functionalCategory: {
                translations: {
                  some: {
                    OR: [
                      { slug: { equals: term, mode: 'insensitive' } },
                      { name: { contains: term, mode: 'insensitive' } },
                    ],
                  },
                },
              },
            },
          ],
        },
      };
    }

    if (andClauses.length > 0) {
      where.AND = andClauses;
    }

    return where;
  }

  private buildCatalogEvidenceWhere(
    query: EditorialCatalogEvidenceQueryDto,
  ): Prisma.EvidenceWhereInput {
    const where: Prisma.EvidenceWhereInput = {};
    const andClauses: Prisma.EvidenceWhereInput[] = [];

    if (query.status) {
      where.editorialStatus = query.status;
    }

    if (query.type?.trim()) {
      where.type = { contains: query.type.trim(), mode: 'insensitive' };
    }

    if (query.activityId?.trim()) {
      where.activities = {
        some: { activityId: query.activityId.trim() },
      };
    }

    if (query.reliabilityFlag) {
      where.reliabilityFlag = query.reliabilityFlag;
    }

    if (query.q?.trim()) {
      const term = query.q.trim();
      andClauses.push({
        OR: [
          { key: { contains: term, mode: 'insensitive' } },
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
        ],
      });
    }

    if (andClauses.length > 0) {
      where.AND = andClauses;
    }

    return where;
  }

  private async buildReviewNavigation(activityId: string, status: EditorialStatus) {
    const items = await this.prisma.activity.findMany({
      where: { editorialStatus: status },
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      select: { id: true },
    });

    const currentIndex = items.findIndex((item) => item.id === activityId);

    return {
      laneStatus: status,
      totalInLane: items.length,
      previousId: currentIndex > 0 ? items[currentIndex - 1]?.id ?? null : null,
      nextId:
        currentIndex >= 0 && currentIndex < items.length - 1
          ? items[currentIndex + 1]?.id ?? null
          : null,
    };
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

  private mapStatusToModerationAction(status: EditorialStatus): ModerationActionType {
    switch (status) {
      case EditorialStatus.approved:
        return ModerationActionType.approve;
      case EditorialStatus.rejected:
        return ModerationActionType.reject;
      case EditorialStatus.needs_correction:
        return ModerationActionType.request_correction;
      case EditorialStatus.archived:
        return ModerationActionType.archive;
      default:
        return ModerationActionType.update_summary;
    }
  }

  private validateBulkTransition(
    activity: {
      officialAiStatus: number | null;
      editorialStatus: EditorialStatus;
      translations: Array<{
        locale: Locale;
        editorialSummary: string | null;
      }>;
      evidenceLinks: Array<{ id: string }>;
    },
    nextEditorialStatus: EditorialStatus,
    effectiveOfficialAiStatus: number | null,
  ): string | null {
    if (nextEditorialStatus !== EditorialStatus.approved) {
      return null;
    }

    const hasSummaryEn = Boolean(
      activity.translations.find((item) => item.locale === Locale.en)?.editorialSummary?.trim(),
    );
    const hasSummaryEs = Boolean(
      activity.translations.find((item) => item.locale === Locale.es)?.editorialSummary?.trim(),
    );
    const hasEvidence = activity.evidenceLinks.length > 0;

    if (!hasSummaryEn || !hasSummaryEs) {
      return 'Bulk approval requires bilingual editorial summaries.';
    }

    if (!hasEvidence) {
      return 'Bulk approval requires at least one linked evidence item.';
    }

    if (typeof effectiveOfficialAiStatus !== 'number') {
      return 'Bulk approval requires an official AI status.';
    }

    return null;
  }

  private pickTranslation<
    T extends {
      locale: Locale;
      title?: string | null;
      shortDescription?: string | null;
      fullDescription?: string | null;
      editorialSummary?: string | null;
      slug?: string | null;
      name?: string | null;
      summary?: string | null;
      context?: string | null;
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
    kind: TaxonomyKind,
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
      name: applyCanonicalTaxonomyLabel(kind, key, locale, translation?.name ?? key),
      slug: translation?.slug ?? key,
    };
  }

  private mapActivityTranslations(
    translations: Array<{
      locale: Locale;
      title: string;
      shortDescription: string | null;
      fullDescription: string | null;
      editorialSummary: string | null;
      slug: string;
    }>,
  ) {
    const en = translations.find((item) => item.locale === Locale.en);
    const es = translations.find((item) => item.locale === Locale.es);

    return {
      en: {
        title: en?.title ?? '',
        shortDescription: en?.shortDescription ?? null,
        fullDescription: en?.fullDescription ?? null,
        editorialSummary: en?.editorialSummary ?? null,
        slug: en?.slug ?? null,
      },
      es: {
        title: es?.title ?? '',
        shortDescription: es?.shortDescription ?? null,
        fullDescription: es?.fullDescription ?? null,
        editorialSummary: es?.editorialSummary ?? null,
        slug: es?.slug ?? null,
      },
    };
  }

  private mapEvidenceTranslations(
    translations: Array<{
      locale: Locale;
      title: string;
      summary: string;
      context: string;
      slug: string;
    }>,
  ) {
    const en = translations.find((item) => item.locale === Locale.en);
    const es = translations.find((item) => item.locale === Locale.es);

    return {
      en: {
        title: en?.title ?? '',
        summary: en?.summary ?? '',
        context: en?.context ?? '',
        slug: en?.slug ?? null,
      },
      es: {
        title: es?.title ?? '',
        summary: es?.summary ?? '',
        context: es?.context ?? '',
        slug: es?.slug ?? null,
      },
    };
  }

  private resolveLocale(locale?: LocaleCode): LocaleCode {
    return locale === 'es' ? 'es' : 'en';
  }
}
