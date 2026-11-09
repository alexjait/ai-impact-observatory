import { EditorialStatus, Granularity, Prisma, PrismaClient, ReliabilityFlag, SeedImportStatus } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

import {
  applyCanonicalTaxonomyLabels,
  assertNoTaxonomyLabelCollisions,
} from '../../shared/taxonomy-labels';

type SeedRow = {
  seed_id: string;
  activity_key: string;
  granularity: string;
  industry_keys: string;
  industry_names_es: string;
  industry_names_en: string;
  category_keys: string;
  category_names_es: string;
  category_names_en: string;
  official_ai_status: string;
  editorial_status: string;
  title_es: string;
  title_en: string;
  short_description_es: string;
  short_description_en: string;
  full_description_es: string;
  full_description_en: string;
  editorial_summary_es: string;
  editorial_summary_en: string;
  seo_title_es: string;
  seo_title_en: string;
  seo_description_es: string;
  seo_description_en: string;
  slug_es: string;
  slug_en: string;
  source_language: string;
  evidence_key: string;
  evidence_type: string;
  evidence_source_text: string;
  evidence_source_url: string;
  evidence_event_date: string;
  evidence_reliability_flag: string;
  evidence_editorial_status: string;
  evidence_title_es: string;
  evidence_title_en: string;
  evidence_summary_es: string;
  evidence_summary_en: string;
  evidence_context_es: string;
  evidence_context_en: string;
  evidence_slug_es: string;
  evidence_slug_en: string;
  tags: string;
};

type NormalizedSeedRow = {
  sourceRowNumber: number;
  seedId: string;
  activityKey: string;
  granularity: Granularity;
  industryKeys: string[];
  industryNamesEs: string[];
  industryNamesEn: string[];
  categoryKeys: string[];
  categoryNamesEs: string[];
  categoryNamesEn: string[];
  officialAiStatus: number;
  editorialStatus: EditorialStatus;
  titleEs: string;
  titleEn: string;
  shortDescriptionEs: string;
  shortDescriptionEn: string;
  fullDescriptionEs: string;
  fullDescriptionEn: string;
  editorialSummaryEs: string;
  editorialSummaryEn: string;
  seoTitleEs: string;
  seoTitleEn: string;
  seoDescriptionEs: string;
  seoDescriptionEn: string;
  slugEs: string;
  slugEn: string;
  sourceLanguage: 'es' | 'en' | 'bilingual';
  evidence: {
    sourceKey: string;
    key: string;
    type: string;
    sourceText: string;
    sourceUrl: string | null;
    eventDate: Date | null;
    reliabilityFlag: ReliabilityFlag;
    editorialStatus: EditorialStatus;
    titleEs: string;
    titleEn: string;
    summaryEs: string;
    summaryEn: string;
    contextEs: string;
    contextEn: string;
    slugEs: string;
    slugEn: string;
  } | null;
};

type ImportSummary = {
  processedRows: number;
  rejectedRows: number;
  warningCount: number;
};

type SeedDbClient = PrismaClient | Prisma.TransactionClient;

const DELIMITED_LIST_SEPARATOR = '|';

function normalizeText(value: string | undefined): string {
  return value?.trim() ?? '';
}

function parseDelimitedList(value: string | undefined): string[] {
  return normalizeText(value)
    .split(DELIMITED_LIST_SEPARATOR)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeGranularity(value: string): Granularity {
  switch (normalizeText(value).toLowerCase()) {
    case 'tarea':
      return Granularity.tarea;
    case 'funcion':
    case 'función':
      return Granularity.funcion;
    case 'rol':
      return Granularity.rol;
    case 'profesion':
    case 'profesión':
      return Granularity.profesion;
    default:
      throw new Error(`Unsupported granularity "${value}".`);
  }
}

function normalizeEditorialStatus(value: string): EditorialStatus {
  switch (normalizeText(value).toLowerCase()) {
    case 'pending':
      return EditorialStatus.pending;
    case 'approved':
      return EditorialStatus.approved;
    case 'rejected':
      return EditorialStatus.rejected;
    case 'needs_correction':
      return EditorialStatus.needs_correction;
    case 'archived':
      return EditorialStatus.archived;
    default:
      throw new Error(`Unsupported editorial status "${value}".`);
  }
}

function normalizeReliabilityFlag(value: string): ReliabilityFlag {
  switch (normalizeText(value).toLowerCase()) {
    case 'normal':
    case 'high':
      return ReliabilityFlag.normal;
    case 'outdated':
      return ReliabilityFlag.outdated;
    case 'low_confidence':
      return ReliabilityFlag.low_confidence;
    case 'archived':
      return ReliabilityFlag.archived;
    default:
      throw new Error(`Unsupported reliability flag "${value}".`);
  }
}

function normalizeSourceLanguage(value: string): 'es' | 'en' | 'bilingual' {
  const normalized = normalizeText(value).toLowerCase();
  if (normalized === 'es' || normalized === 'en' || normalized === 'bilingual') {
    return normalized;
  }

  throw new Error(`Unsupported source_language "${value}".`);
}

function normalizeOptionalUrl(value: string): string | null {
  const normalized = normalizeText(value);
  return normalized ? normalized : null;
}

function normalizeOptionalDate(value: string): Date | null {
  const normalized = normalizeText(value);
  if (!normalized) {
    return null;
  }

  const parsed = new Date(`${normalized}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid evidence_event_date "${value}".`);
  }

  return parsed;
}

function buildCanonicalEvidenceKey(row: SeedRow): string {
  const slug = normalizeText(row.evidence_slug_en) || normalizeText(row.evidence_slug_es);
  const eventDate = normalizeText(row.evidence_event_date);

  if (slug && eventDate) {
    return `${slug}-${eventDate}`;
  }

  if (slug) {
    return slug;
  }

  return normalizeText(row.evidence_key);
}

function hasEvidencePayload(row: SeedRow): boolean {
  return [
    row.evidence_key,
    row.evidence_type,
    row.evidence_source_text,
    row.evidence_source_url,
    row.evidence_event_date,
    row.evidence_reliability_flag,
    row.evidence_editorial_status,
    row.evidence_title_es,
    row.evidence_title_en,
    row.evidence_summary_es,
    row.evidence_summary_en,
    row.evidence_context_es,
    row.evidence_context_en,
    row.evidence_slug_es,
    row.evidence_slug_en,
  ].some((value) => normalizeText(value).length > 0);
}

function assertRequiredFields(
  values: Array<[string, string]>,
  rowNumber: number,
): void {
  for (const [label, value] of values) {
    if (!normalizeText(value)) {
      throw new Error(`Row ${rowNumber}: missing required field "${label}".`);
    }
  }
}

function assertMatchingLocalizedLists(
  label: string,
  keys: string[],
  namesEs: string[],
  namesEn: string[],
  rowNumber: number,
): void {
  if (keys.length === 0) {
    throw new Error(`Row ${rowNumber}: "${label}" cannot be empty.`);
  }

  if (keys.length !== namesEs.length || keys.length !== namesEn.length) {
    throw new Error(
      `Row ${rowNumber}: "${label}" keys and localized names must have the same number of items.`,
    );
  }
}

function normalizeRow(row: SeedRow, rowNumber: number): NormalizedSeedRow {
  assertRequiredFields(
    [
      ['seed_id', row.seed_id],
      ['activity_key', row.activity_key],
      ['granularity', row.granularity],
      ['industry_keys', row.industry_keys],
      ['industry_names_es', row.industry_names_es],
      ['industry_names_en', row.industry_names_en],
      ['category_keys', row.category_keys],
      ['category_names_es', row.category_names_es],
      ['category_names_en', row.category_names_en],
      ['official_ai_status', row.official_ai_status],
      ['editorial_status', row.editorial_status],
      ['title_es', row.title_es],
      ['title_en', row.title_en],
      ['short_description_es', row.short_description_es],
      ['short_description_en', row.short_description_en],
      ['full_description_es', row.full_description_es],
      ['full_description_en', row.full_description_en],
      ['editorial_summary_es', row.editorial_summary_es],
      ['editorial_summary_en', row.editorial_summary_en],
      ['seo_title_es', row.seo_title_es],
      ['seo_title_en', row.seo_title_en],
      ['seo_description_es', row.seo_description_es],
      ['seo_description_en', row.seo_description_en],
      ['slug_es', row.slug_es],
      ['slug_en', row.slug_en],
      ['source_language', row.source_language],
    ],
    rowNumber,
  );

  const industryKeys = parseDelimitedList(row.industry_keys);
  const industryNamesEs = parseDelimitedList(row.industry_names_es);
  const industryNamesEn = parseDelimitedList(row.industry_names_en);
  const categoryKeys = parseDelimitedList(row.category_keys);
  const categoryNamesEs = parseDelimitedList(row.category_names_es);
  const categoryNamesEn = parseDelimitedList(row.category_names_en);

  assertMatchingLocalizedLists('industry', industryKeys, industryNamesEs, industryNamesEn, rowNumber);
  assertMatchingLocalizedLists('category', categoryKeys, categoryNamesEs, categoryNamesEn, rowNumber);

  const officialAiStatus = Number.parseInt(normalizeText(row.official_ai_status), 10);
  if (!Number.isInteger(officialAiStatus) || officialAiStatus < 0 || officialAiStatus > 5) {
    throw new Error(`Row ${rowNumber}: "official_ai_status" must be an integer between 0 and 5.`);
  }

  let evidence: NormalizedSeedRow['evidence'] = null;
  if (hasEvidencePayload(row)) {
    assertRequiredFields(
      [
        ['evidence_key', row.evidence_key],
        ['evidence_type', row.evidence_type],
        ['evidence_source_text', row.evidence_source_text],
        ['evidence_reliability_flag', row.evidence_reliability_flag],
        ['evidence_editorial_status', row.evidence_editorial_status],
        ['evidence_title_es', row.evidence_title_es],
        ['evidence_title_en', row.evidence_title_en],
        ['evidence_summary_es', row.evidence_summary_es],
        ['evidence_summary_en', row.evidence_summary_en],
        ['evidence_context_es', row.evidence_context_es],
        ['evidence_context_en', row.evidence_context_en],
        ['evidence_slug_es', row.evidence_slug_es],
        ['evidence_slug_en', row.evidence_slug_en],
      ],
      rowNumber,
    );

    evidence = {
      sourceKey: normalizeText(row.evidence_key),
      key: buildCanonicalEvidenceKey(row),
      type: normalizeText(row.evidence_type),
      sourceText: normalizeText(row.evidence_source_text),
      sourceUrl: normalizeOptionalUrl(row.evidence_source_url),
      eventDate: normalizeOptionalDate(row.evidence_event_date),
      reliabilityFlag: normalizeReliabilityFlag(row.evidence_reliability_flag),
      editorialStatus: normalizeEditorialStatus(row.evidence_editorial_status),
      titleEs: normalizeText(row.evidence_title_es),
      titleEn: normalizeText(row.evidence_title_en),
      summaryEs: normalizeText(row.evidence_summary_es),
      summaryEn: normalizeText(row.evidence_summary_en),
      contextEs: normalizeText(row.evidence_context_es),
      contextEn: normalizeText(row.evidence_context_en),
      slugEs: normalizeText(row.evidence_slug_es),
      slugEn: normalizeText(row.evidence_slug_en),
    };
  }

  const canonicalIndustries = industryKeys.map((key, index) =>
    applyCanonicalTaxonomyLabels('industry', key, {
      es: industryNamesEs[index],
      en: industryNamesEn[index],
    }),
  );

  const canonicalCategories = categoryKeys.map((key, index) =>
    applyCanonicalTaxonomyLabels('category', key, {
      es: categoryNamesEs[index],
      en: categoryNamesEn[index],
    }),
  );

  return {
    sourceRowNumber: rowNumber,
    seedId: normalizeText(row.seed_id),
    activityKey: normalizeText(row.activity_key),
    granularity: normalizeGranularity(row.granularity),
    industryKeys,
    industryNamesEs: canonicalIndustries.map((item) => item.es),
    industryNamesEn: canonicalIndustries.map((item) => item.en),
    categoryKeys,
    categoryNamesEs: canonicalCategories.map((item) => item.es),
    categoryNamesEn: canonicalCategories.map((item) => item.en),
    officialAiStatus,
    editorialStatus: normalizeEditorialStatus(row.editorial_status),
    titleEs: normalizeText(row.title_es),
    titleEn: normalizeText(row.title_en),
    shortDescriptionEs: normalizeText(row.short_description_es),
    shortDescriptionEn: normalizeText(row.short_description_en),
    fullDescriptionEs: normalizeText(row.full_description_es),
    fullDescriptionEn: normalizeText(row.full_description_en),
    editorialSummaryEs: normalizeText(row.editorial_summary_es),
    editorialSummaryEn: normalizeText(row.editorial_summary_en),
    seoTitleEs: normalizeText(row.seo_title_es),
    seoTitleEn: normalizeText(row.seo_title_en),
    seoDescriptionEs: normalizeText(row.seo_description_es),
    seoDescriptionEn: normalizeText(row.seo_description_en),
    slugEs: normalizeText(row.slug_es),
    slugEn: normalizeText(row.slug_en),
    sourceLanguage: normalizeSourceLanguage(row.source_language),
    evidence,
  };
}

async function readSeedRows(sourcePath: string): Promise<SeedRow[]> {
  const filePath = resolve(process.cwd(), sourcePath);
  const rawCsv = await readFile(filePath, 'utf8');
  const firstLine = rawCsv.split(/\r?\n/, 1)[0] ?? '';
  const delimiter = firstLine.includes(';') ? ';' : ',';
  return parse(rawCsv, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    delimiter,
  }) as SeedRow[];
}

async function upsertIndustry(prisma: SeedDbClient, key: string, nameEs: string, nameEn: string) {
  const industry = await prisma.industry.upsert({
    where: { key },
    update: { isActive: true },
    create: { key },
  });

  await prisma.industryTranslation.upsert({
    where: {
      industryId_locale: {
        industryId: industry.id,
        locale: 'es',
      },
    },
    update: {
      name: nameEs,
      slug: key,
    },
    create: {
      industryId: industry.id,
      locale: 'es',
      name: nameEs,
      slug: key,
    },
  });

  await prisma.industryTranslation.upsert({
    where: {
      industryId_locale: {
        industryId: industry.id,
        locale: 'en',
      },
    },
    update: {
      name: nameEn,
      slug: key,
    },
    create: {
      industryId: industry.id,
      locale: 'en',
      name: nameEn,
      slug: key,
    },
  });

  return industry;
}

async function upsertCategory(prisma: SeedDbClient, key: string, nameEs: string, nameEn: string) {
  const category = await prisma.functionalCategory.upsert({
    where: { key },
    update: { isActive: true },
    create: { key },
  });

  await prisma.functionalCategoryTranslation.upsert({
    where: {
      functionalCategoryId_locale: {
        functionalCategoryId: category.id,
        locale: 'es',
      },
    },
    update: {
      name: nameEs,
      slug: key,
    },
    create: {
      functionalCategoryId: category.id,
      locale: 'es',
      name: nameEs,
      slug: key,
    },
  });

  await prisma.functionalCategoryTranslation.upsert({
    where: {
      functionalCategoryId_locale: {
        functionalCategoryId: category.id,
        locale: 'en',
      },
    },
    update: {
      name: nameEn,
      slug: key,
    },
    create: {
      functionalCategoryId: category.id,
      locale: 'en',
      name: nameEn,
      slug: key,
    },
  });

  return category;
}

export async function resetSeedDomain(prisma: PrismaClient): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.commentReport.deleteMany();
    await tx.moderationAction.deleteMany();
    await tx.comment.deleteMany();
    await tx.editorialActivityStatusHistory.deleteMany();
    await tx.evidenceProposalActivity.deleteMany();
    await tx.evidenceProposalTranslation.deleteMany();
    await tx.evidenceProposal.deleteMany();
    await tx.activityProposalIndustry.deleteMany();
    await tx.activityProposalCategory.deleteMany();
    await tx.activityProposalTranslation.deleteMany();
    await tx.activityProposal.deleteMany();
    await tx.evidenceActivity.deleteMany();
    await tx.evidenceTranslation.deleteMany();
    await tx.activityCategory.deleteMany();
    await tx.activityIndustry.deleteMany();
    await tx.activityTranslation.deleteMany();
    await tx.evidence.deleteMany();
    await tx.activity.deleteMany();
    await tx.functionalCategoryTranslation.deleteMany();
    await tx.functionalCategory.deleteMany();
    await tx.industryTranslation.deleteMany();
    await tx.industry.deleteMany();
    await tx.seedImportItem.deleteMany();
    await tx.seedImportRun.deleteMany();
  });
}

export async function runOfficialSeedImport(
  prisma: PrismaClient,
  sourcePath: string,
) {
  const run = await prisma.seedImportRun.create({
    data: {
      sourcePath,
      status: SeedImportStatus.running,
    },
  });

  try {
    const rows = await readSeedRows(sourcePath);
    const normalizedRows = rows.map((rawRow, index) => normalizeRow(rawRow, index + 2));

    assertNoTaxonomyLabelCollisions(
      'industry',
      normalizedRows.flatMap((row) =>
        row.industryKeys.map((key, index) => ({
          key,
          labels: {
            es: row.industryNamesEs[index],
            en: row.industryNamesEn[index],
          },
          rowNumber: row.sourceRowNumber,
        })),
      ),
      `Seed import "${sourcePath}" industries`,
    );

    assertNoTaxonomyLabelCollisions(
      'category',
      normalizedRows.flatMap((row) =>
        row.categoryKeys.map((key, index) => ({
          key,
          labels: {
            es: row.categoryNamesEs[index],
            en: row.categoryNamesEn[index],
          },
          rowNumber: row.sourceRowNumber,
        })),
      ),
      `Seed import "${sourcePath}" categories`,
    );

    let processedRows = 0;
    let rejectedRows = 0;
    let warningCount = 0;

    for (const row of normalizedRows) {
      try {
        await prisma.$transaction(async (tx) => {
          const industries = [];
          for (const [industryIndex, industryKey] of row.industryKeys.entries()) {
            industries.push(
              await upsertIndustry(tx, industryKey, row.industryNamesEs[industryIndex], row.industryNamesEn[industryIndex]),
            );
          }

          const categories = [];
          for (const [categoryIndex, categoryKey] of row.categoryKeys.entries()) {
            categories.push(
              await upsertCategory(tx, categoryKey, row.categoryNamesEs[categoryIndex], row.categoryNamesEn[categoryIndex]),
            );
          }

          const activity = await tx.activity.upsert({
            where: { key: row.activityKey },
            update: {
              granularity: row.granularity,
              officialAiStatus: row.officialAiStatus,
              editorialStatus: row.editorialStatus,
            },
            create: {
              key: row.activityKey,
              granularity: row.granularity,
              officialAiStatus: row.officialAiStatus,
              editorialStatus: row.editorialStatus,
            },
          });

          await tx.activityTranslation.upsert({
            where: {
              activityId_locale: {
                activityId: activity.id,
                locale: 'es',
              },
            },
            update: {
              title: row.titleEs,
              shortDescription: row.shortDescriptionEs,
              fullDescription: row.fullDescriptionEs,
              editorialSummary: row.editorialSummaryEs,
              seoTitle: row.seoTitleEs,
              seoDescription: row.seoDescriptionEs,
              slug: row.slugEs,
            },
            create: {
              activityId: activity.id,
              locale: 'es',
              title: row.titleEs,
              shortDescription: row.shortDescriptionEs,
              fullDescription: row.fullDescriptionEs,
              editorialSummary: row.editorialSummaryEs,
              seoTitle: row.seoTitleEs,
              seoDescription: row.seoDescriptionEs,
              slug: row.slugEs,
            },
          });

          await tx.activityTranslation.upsert({
            where: {
              activityId_locale: {
                activityId: activity.id,
                locale: 'en',
              },
            },
            update: {
              title: row.titleEn,
              shortDescription: row.shortDescriptionEn,
              fullDescription: row.fullDescriptionEn,
              editorialSummary: row.editorialSummaryEn,
              seoTitle: row.seoTitleEn,
              seoDescription: row.seoDescriptionEn,
              slug: row.slugEn,
            },
            create: {
              activityId: activity.id,
              locale: 'en',
              title: row.titleEn,
              shortDescription: row.shortDescriptionEn,
              fullDescription: row.fullDescriptionEn,
              editorialSummary: row.editorialSummaryEn,
              seoTitle: row.seoTitleEn,
              seoDescription: row.seoDescriptionEn,
              slug: row.slugEn,
            },
          });

          for (const industry of industries) {
            await tx.activityIndustry.upsert({
              where: {
                activityId_industryId: {
                  activityId: activity.id,
                  industryId: industry.id,
                },
              },
              update: {},
              create: {
                activityId: activity.id,
                industryId: industry.id,
              },
            });
          }

          for (const category of categories) {
            await tx.activityCategory.upsert({
              where: {
                activityId_functionalCategoryId: {
                  activityId: activity.id,
                  functionalCategoryId: category.id,
                },
              },
              update: {},
              create: {
                activityId: activity.id,
                functionalCategoryId: category.id,
              },
            });
          }

          let sourceKey = row.activityKey;

          if (row.evidence) {
            const evidence = await tx.evidence.upsert({
              where: { key: row.evidence.key },
              update: {
                type: row.evidence.type,
                sourceText: row.evidence.sourceText,
                sourceUrl: row.evidence.sourceUrl,
                eventDate: row.evidence.eventDate,
                reliabilityFlag: row.evidence.reliabilityFlag,
                editorialStatus: row.evidence.editorialStatus,
              },
              create: {
                key: row.evidence.key,
                type: row.evidence.type,
                sourceText: row.evidence.sourceText,
                sourceUrl: row.evidence.sourceUrl,
                eventDate: row.evidence.eventDate,
                reliabilityFlag: row.evidence.reliabilityFlag,
                editorialStatus: row.evidence.editorialStatus,
              },
            });

            await tx.evidenceTranslation.upsert({
              where: {
                evidenceId_locale: {
                  evidenceId: evidence.id,
                  locale: 'es',
                },
              },
              update: {
                title: row.evidence.titleEs,
                summary: row.evidence.summaryEs,
                context: row.evidence.contextEs,
                slug: row.evidence.slugEs,
              },
              create: {
                evidenceId: evidence.id,
                locale: 'es',
                title: row.evidence.titleEs,
                summary: row.evidence.summaryEs,
                context: row.evidence.contextEs,
                slug: row.evidence.slugEs,
              },
            });

            await tx.evidenceTranslation.upsert({
              where: {
                evidenceId_locale: {
                  evidenceId: evidence.id,
                  locale: 'en',
                },
              },
              update: {
                title: row.evidence.titleEn,
                summary: row.evidence.summaryEn,
                context: row.evidence.contextEn,
                slug: row.evidence.slugEn,
              },
              create: {
                evidenceId: evidence.id,
                locale: 'en',
                title: row.evidence.titleEn,
                summary: row.evidence.summaryEn,
                context: row.evidence.contextEn,
                slug: row.evidence.slugEn,
              },
            });

            await tx.evidenceActivity.upsert({
              where: {
                evidenceId_activityId: {
                  evidenceId: evidence.id,
                  activityId: activity.id,
                },
              },
              update: {},
              create: {
                evidenceId: evidence.id,
                activityId: activity.id,
              },
            });

            sourceKey = `${row.activityKey}::${row.evidence.sourceKey}`;
          }

          await tx.seedImportItem.create({
            data: {
              runId: run.id,
              rowNumber: row.sourceRowNumber,
              sourceKey,
              status: SeedImportStatus.completed,
            },
          });
        });

        processedRows += 1;
      } catch (error) {
        rejectedRows += 1;
        const message = error instanceof Error ? error.message : 'Unknown row import error';
        await prisma.seedImportItem.create({
          data: {
            runId: run.id,
            rowNumber: row.sourceRowNumber,
            sourceKey: row.activityKey || null,
            status: SeedImportStatus.failed,
            error: message,
          },
        });
      }
    }

    return prisma.seedImportRun.update({
      where: { id: run.id },
      data: {
        status: SeedImportStatus.completed,
        processedRows,
        rejectedRows,
        warningCount,
        finishedAt: new Date(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown seed import error';
    await prisma.seedImportRun.update({
      where: { id: run.id },
      data: {
        status: SeedImportStatus.failed,
        errorMessage: message,
        finishedAt: new Date(),
      },
    });
    throw error;
  }
}

export async function resetAndRunOfficialSeedImport(
  prisma: PrismaClient,
  sourcePath: string,
) {
  await resetSeedDomain(prisma);
  return runOfficialSeedImport(prisma, sourcePath);
}

export type { ImportSummary, NormalizedSeedRow, SeedRow };
