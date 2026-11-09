import { Injectable } from '@nestjs/common';
import {
  CommentVisibilityStatus,
  EditorialStatus,
  Locale,
  Prisma,
  ReliabilityFlag,
} from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { PublicSettingsService } from '../admin/public-settings.service';
import { env } from '../../shared/env';
import {
  applyCanonicalTaxonomyLabel,
  ensureUniqueTaxonomyItems,
  TaxonomyKind,
} from '../../shared/taxonomy-labels';
import { publicErrors } from './public.errors';
import { ListActivitiesQueryDto } from './dto/list-activities-query.dto';
import { SearchQueryDto } from './dto/search-query.dto';

type LocaleCode = 'en' | 'es';

@Injectable()
export class PublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly publicSettingsService: PublicSettingsService,
  ) {}

  async search(query: SearchQueryDto, userId?: string) {
    const locale = this.resolveLocale(query.locale);
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const onlyFollowed = query.followed === 'true';

    if (onlyFollowed && !userId) {
      return {
        items: [],
        total: 0,
        page,
        pageSize,
        facets: {
          industries: [],
          categories: [],
          aiStatuses: [],
        },
      };
    }

    const where = this.buildActivityWhere(query, locale, true, userId);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.activity.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
        include: this.activityInclude(locale, userId),
      }),
      this.prisma.activity.count({ where }),
    ]);

    const mappedItems = items.map((item) => this.mapActivityCard(item, locale));

    return {
      items: mappedItems,
      total,
      page,
      pageSize,
      facets: {
        industries: this.collectCounts(mappedItems.flatMap((item) => item.industries)),
        categories: this.collectCounts(mappedItems.flatMap((item) => item.categories)),
        aiStatuses: this.collectCounts(mappedItems.map((item) => String(item.officialAiStatus ?? 'unknown'))),
      },
    };
  }

  async listActivities(query: ListActivitiesQueryDto, userId?: string) {
    const locale = this.resolveLocale(query.locale);
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const onlyFollowed = query.followed === 'true';

    if (onlyFollowed && !userId) {
      return {
        items: [],
        total: 0,
        page,
        pageSize,
      };
    }

    const where = this.buildActivityWhere(query, locale, false, userId);
    const orderBy =
      query.sort === 'title'
        ? { createdAt: 'desc' as const }
        : { updatedAt: 'desc' as const };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.activity.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy,
        include: this.activityInclude(locale, userId),
      }),
      this.prisma.activity.count({ where }),
    ]);

    const mappedItems = items
      .map((item) => this.mapActivityCard(item, locale))
      .sort((left, right) =>
        query.sort === 'title'
          ? left.title.localeCompare(right.title)
          : 0,
      );

    return {
      items: mappedItems,
      total,
      page,
      pageSize,
    };
  }

  async getActivityBySlug(slug: string, localeQuery?: LocaleCode, userId?: string) {
    const locale = this.resolveLocale(localeQuery);
    const commentsEnabled = await this.publicSettingsService.arePublicCommentsEnabled();
    const translation = await this.prisma.activityTranslation.findFirst({
      where: {
        slug,
        locale,
        activity: {
          editorialStatus: EditorialStatus.approved,
        },
      },
      include: {
        activity: {
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
              where: {
                evidence: {
                  editorialStatus: EditorialStatus.approved,
                },
              },
              include: {
                evidence: {
                  include: {
                    translations: true,
                  },
                },
              },
            },
            comments: {
              where: {
                visibilityStatus: CommentVisibilityStatus.visible,
                parentCommentId: null,
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
              },
            },
            ...(userId
              ? {
                  followers: {
                    where: { userId },
                    select: { id: true },
                  },
                }
              : {}),
          },
        },
      },
    });

    if (!translation) {
      throw publicErrors.activityNotFound();
    }

    const activity = translation.activity;
    const activityTranslation = this.pickTranslation(activity.translations, locale);

    const evidences = activity.evidenceLinks
      .map((item) => this.mapEvidenceCard(item.evidence, locale))
      .sort((left, right) => {
        const leftTime = left.eventDate ? new Date(left.eventDate).getTime() : 0;
        const rightTime = right.eventDate ? new Date(right.eventDate).getTime() : 0;
        return rightTime - leftTime;
      });

    return {
      id: activity.id,
      key: activity.key,
      granularity: activity.granularity,
      officialAiStatus: activity.officialAiStatus,
      title: activityTranslation?.title ?? translation.title,
      slug: activityTranslation?.slug ?? translation.slug,
      shortDescription: activityTranslation?.shortDescription ?? null,
      fullDescription: activityTranslation?.fullDescription ?? null,
      editorialSummary: activityTranslation?.editorialSummary ?? null,
      isFollowing:
        Array.isArray((activity as { followers?: Array<{ id: string }> }).followers) &&
        ((activity as { followers?: Array<{ id: string }> }).followers?.length ?? 0) > 0,
      publicFeatures: {
        commentsEnabled,
      },
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
      evidences,
      comments: commentsEnabled
        ? activity.comments.map((comment) => this.mapComment(comment))
        : [],
      relatedActivities: [],
    };
  }

  async getEvidenceByIdOrSlug(idOrSlug: string, localeQuery?: LocaleCode) {
    const locale = this.resolveLocale(localeQuery);
    const commentsEnabled = await this.publicSettingsService.arePublicCommentsEnabled();

    const evidence =
      (await this.prisma.evidence.findFirst({
        where: {
          editorialStatus: EditorialStatus.approved,
          OR: [
            { id: idOrSlug },
            {
              translations: {
                some: {
                  locale,
                  slug: idOrSlug,
                },
              },
            },
          ],
        },
        include: {
          translations: true,
          comments: {
            where: {
              visibilityStatus: CommentVisibilityStatus.visible,
              parentCommentId: null,
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
            },
          },
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
      })) ?? null;

    if (!evidence) {
      throw publicErrors.evidenceNotFound();
    }

    const translation = this.pickTranslation(evidence.translations, locale);

    return {
      id: evidence.id,
      type: evidence.type,
      title: translation?.title ?? null,
      slug: translation?.slug ?? null,
      summary: translation?.summary ?? null,
      context: translation?.context ?? null,
      sourceText: evidence.sourceText,
      sourceUrl: evidence.sourceUrl,
      eventDate: evidence.eventDate,
      reliabilityFlag: evidence.reliabilityFlag,
      publicFeatures: {
        commentsEnabled,
      },
      activities: evidence.activities.map((item) => {
        const activityTranslation = this.pickTranslation(item.activity.translations, locale);

        return {
          id: item.activity.id,
          key: item.activity.key,
          title: activityTranslation?.title ?? item.activity.key,
          slug: activityTranslation?.slug ?? null,
        };
      }),
      comments: commentsEnabled
        ? evidence.comments.map((comment) => this.mapComment(comment))
        : [],
    };
  }

  async getMethodology(localeQuery?: LocaleCode) {
    const locale = this.resolveLocale(localeQuery);

    const copy =
      locale === 'es'
        ? {
            title: 'Metodología',
            summary:
              'El portal separa observación pública, evidencia aprobada y criterio de revisión para estimar cómo cambia una actividad concreta con IA.',
            levels: [
              {
                value: 0,
                label: '0 - Sin impacto relevante detectado',
                description:
                  'No aparecen señales suficientemente claras de cambio práctico en la actividad.',
                example:
                  'Ejemplo: la IA se menciona en el sector, pero no cambia todavía cómo se hace ese trabajo.',
              },
              {
                value: 1,
                label: '1 - Asistencia puntual',
                description:
                  'La IA ayuda en momentos concretos, pero no cambia el flujo principal de trabajo.',
                example:
                  'Ejemplo: se usa para redactar borradores o consultas rápidas, sin modificar la tarea de fondo.',
              },
              {
                value: 2,
                label: '2 - Aumento de productividad significativo',
                description:
                  'La IA acelera partes relevantes de la actividad y reduce tiempo operativo.',
                example:
                  'Ejemplo: genera primeras versiones, clasifica insumos o automatiza pasos repetitivos.',
              },
              {
                value: 3,
                label: '3 - Reemplazo parcial operativo',
                description:
                  'La IA ya cubre una parte visible del trabajo, aunque sigue necesitando supervisión humana.',
                example:
                  'Ejemplo: resuelve una primera capa de soporte, revisión o producción antes del control final.',
              },
              {
                value: 4,
                label: '4 - Reemplazo mayoritario en escenarios concretos',
                description:
                  'En ciertos contextos, la mayor parte de la actividad puede resolverse con IA y control humano posterior.',
                example:
                  'Ejemplo: tareas altamente repetitivas, estandarizadas o con reglas claras.',
              },
              {
                value: 5,
                label: '5 - Reemplazo casi total o total en casos reales',
                description:
                  'Hay evidencia de que la actividad puede resolverse casi por completo con IA en escenarios reales.',
                example:
                  'Ejemplo: autoservicio o automatización end to end donde la intervención humana es excepcional.',
              },
            ],
          }
        : {
            title: 'Methodology',
            summary:
              'The portal separates public signals, approved evidence, and review judgment to estimate how a concrete activity is changing with AI.',
            levels: [
              {
                value: 0,
                label: '0 - No relevant impact detected',
                description:
                  'There is not enough practical evidence yet to claim meaningful change in the activity.',
                example:
                  'Example: AI is discussed in the sector, but it is not yet changing how the work is actually done.',
              },
              {
                value: 1,
                label: '1 - Occasional assistance',
                description:
                  'AI helps in isolated moments, but it does not reshape the main workflow.',
                example:
                  'Example: it is used for quick drafts or lookups without changing the core task.',
              },
              {
                value: 2,
                label: '2 - Significant productivity increase',
                description:
                  'AI speeds up relevant parts of the activity and reduces operational time.',
                example:
                  'Example: it generates first drafts, classifies inputs, or automates repetitive steps.',
              },
              {
                value: 3,
                label: '3 - Partial operational replacement',
                description:
                  'AI is already handling a visible share of the activity, while human supervision remains necessary.',
                example:
                  'Example: it covers a first layer of support, review, or production before final control.',
              },
              {
                value: 4,
                label: '4 - Majority replacement in specific scenarios',
                description:
                  'In some contexts, most of the activity can already be completed with AI plus human oversight.',
                example:
                  'Example: highly repetitive, standardized, or rules-based work.',
              },
              {
                value: 5,
                label: '5 - Near-total or total replacement in real cases',
                description:
                  'There is evidence that the activity can be completed almost entirely by AI in real-world scenarios.',
                example:
                  'Example: end-to-end automation or self-service flows where human intervention is rare.',
              },
            ],
          };

    return {
      ...copy,
      scale: copy.levels.map((item) => item.label),
    };
  }

  async getTaxonomies(localeQuery?: LocaleCode) {
    const locale = this.resolveLocale(localeQuery);
    const [industries, categories] = await this.prisma.$transaction([
      this.prisma.industry.findMany({
        where: { isActive: true },
        include: { translations: true },
        orderBy: { key: 'asc' },
      }),
      this.prisma.functionalCategory.findMany({
        where: { isActive: true },
        include: { translations: true },
        orderBy: { key: 'asc' },
      }),
    ]);

    return {
      industries: ensureUniqueTaxonomyItems(
        'industry',
        locale,
        industries.map((industry) =>
          this.mapNamedTranslation('industry', industry.translations, locale, industry.key),
        ),
      )
        .sort((left, right) => this.compareLocalizedNames(left.name, right.name, locale)),
      categories: ensureUniqueTaxonomyItems(
        'category',
        locale,
        categories.map((category) =>
          this.mapNamedTranslation('category', category.translations, locale, category.key),
        ),
      )
        .sort((left, right) => this.compareLocalizedNames(left.name, right.name, locale)),
    };
  }

  private compareLocalizedNames(left: string, right: string, locale: LocaleCode) {
    return left.localeCompare(right, locale, {
      sensitivity: 'base',
      ignorePunctuation: true,
    });
  }

  private buildActivityWhere(
    query: SearchQueryDto | ListActivitiesQueryDto,
    locale: LocaleCode,
    includeSearch: boolean,
    userId?: string,
  ): Prisma.ActivityWhereInput {
    const onlyFollowed = query.followed === 'true';

    const where: Prisma.ActivityWhereInput = onlyFollowed
      ? userId
        ? {
            followers: {
              some: {
                userId,
              },
            },
          }
        : {
            id: '__no-followed-activities__',
          }
      : {
          editorialStatus: EditorialStatus.approved,
        };

    if (query.industry) {
      where.industries = {
        some: {
          industry: {
            key: query.industry,
          },
        },
      };
    }

    if (query.category) {
      where.categories = {
        some: {
          functionalCategory: {
            key: query.category,
          },
        },
      };
    }

    if (query.granularity) {
      where.granularity = query.granularity as never;
    }

    if (query.aiStatus) {
      const parsed = Number(query.aiStatus);
      if (Number.isInteger(parsed)) {
        where.officialAiStatus = parsed;
      }
    }

    const searchTerm =
      includeSearch && 'q' in query && typeof query.q === 'string'
        ? query.q.trim()
        : '';

    if (searchTerm) {
      where.translations = {
        some: {
          locale,
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { shortDescription: { contains: searchTerm, mode: 'insensitive' } },
            { fullDescription: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
      };
    }

    return where;
  }

  private activityInclude(locale: LocaleCode, userId?: string) {
    return {
      translations: {
        where: {
          locale: {
            in: [locale as Locale, env.defaultLocale as Locale],
          },
        },
      },
      industries: {
        include: {
          industry: {
            include: {
              translations: {
                where: {
                  locale: {
                    in: [locale as Locale, env.defaultLocale as Locale],
                  },
                },
              },
            },
          },
        },
      },
      categories: {
        include: {
          functionalCategory: {
            include: {
              translations: {
                where: {
                  locale: {
                    in: [locale as Locale, env.defaultLocale as Locale],
                  },
                },
              },
            },
          },
        },
      },
      ...(userId
        ? {
            followers: {
              where: { userId },
              select: { id: true },
            },
          }
        : {}),
    } satisfies Prisma.ActivityInclude;
  }

  private mapActivityCard(
    activity: Prisma.ActivityGetPayload<{
      include: ReturnType<PublicService['activityInclude']>;
    }>,
    locale: LocaleCode,
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
      isFollowing:
        Array.isArray((activity as { followers?: Array<{ id: string }> }).followers) &&
        ((activity as { followers?: Array<{ id: string }> }).followers?.length ?? 0) > 0,
      industries: activity.industries.map((item) =>
        this.mapNamedTranslation('industry', item.industry.translations, locale, item.industry.key).name,
      ),
      categories: activity.categories.map((item) =>
        this.mapNamedTranslation(
          'category',
          item.functionalCategory.translations,
          locale,
          item.functionalCategory.key,
        ).name,
      ),
    };
  }

  private mapEvidenceCard(
    evidence: Prisma.EvidenceGetPayload<{
      include: {
        translations: true;
      };
    }>,
    locale: LocaleCode,
  ) {
    const translation = this.pickTranslation(evidence.translations, locale);

    return {
      id: evidence.id,
      type: evidence.type,
      title: translation?.title ?? evidence.type,
      slug: translation?.slug ?? evidence.id,
      summary: translation?.summary ?? null,
      sourceText: evidence.sourceText,
      sourceUrl: evidence.sourceUrl,
      reliabilityFlag: evidence.reliabilityFlag,
      eventDate: evidence.eventDate,
      showReliabilityWarning:
        evidence.reliabilityFlag === ReliabilityFlag.low_confidence ||
        evidence.reliabilityFlag === ReliabilityFlag.outdated,
    };
  }

  private mapComment(
    comment: Prisma.CommentGetPayload<{
      include: {
        author: {
          select: {
            id: true;
            displayName: true;
          };
        };
        replies: {
          include: {
            author: {
              select: {
                id: true;
                displayName: true;
              };
            };
          };
        };
      };
    }>,
  ) {
    return {
      id: comment.id,
      text: comment.text,
      createdAt: comment.createdAt,
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

  private pickTranslation<
    T extends {
      locale: Locale;
    },
  >(translations: T[], locale: LocaleCode): T | null {
    return (
      translations.find((translation) => translation.locale === locale) ??
      translations.find((translation) => translation.locale === env.defaultLocale) ??
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

  private collectCounts(values: string[]) {
    return Object.entries(
      values.reduce<Record<string, number>>((accumulator, value) => {
        accumulator[value] = (accumulator[value] ?? 0) + 1;
        return accumulator;
      }, {}),
    ).map(([value, count]) => ({ value, count }));
  }

  private resolveLocale(locale?: LocaleCode): LocaleCode {
    return locale === 'es' ? 'es' : 'en';
  }
}

