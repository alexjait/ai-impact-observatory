export type TaxonomyKind = 'industry' | 'category';
export type TaxonomyLocale = 'en' | 'es';

type TaxonomyLabels = Record<TaxonomyLocale, string>;

type TaxonomyCollisionEntry = {
  key: string;
  labels: TaxonomyLabels;
  rowNumber?: number;
};

type NamedTaxonomyItem = {
  key: string;
  name: string;
  slug: string;
};

const TAXONOMY_LABEL_OVERRIDES: Record<TaxonomyKind, Record<string, TaxonomyLabels>> = {
  industry: {
    'media-content': {
      es: 'Medios y contenidos',
      en: 'Media and content',
    },
  },
  category: {
    'construction-engineering-operations': {
      es: 'Operaciones de construcci\u00f3n e ingenier\u00eda',
      en: 'Construction and engineering operations',
    },
    'security-risk-investigation': {
      es: 'Seguridad, riesgo e investigaci\u00f3n',
      en: 'Security, risk, and investigation',
    },
  },
};

function normalizeLabelForCollision(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function titleCaseWords(value: string): string {
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function humanizeTaxonomyKey(key: string): string {
  return titleCaseWords(key.replace(/[-_]+/g, ' '));
}

export function applyCanonicalTaxonomyLabels(
  kind: TaxonomyKind,
  key: string,
  labels: TaxonomyLabels,
): TaxonomyLabels {
  const override = TAXONOMY_LABEL_OVERRIDES[kind][key];

  return {
    es: override?.es ?? labels.es,
    en: override?.en ?? labels.en,
  };
}

export function applyCanonicalTaxonomyLabel(
  kind: TaxonomyKind,
  key: string,
  locale: TaxonomyLocale,
  label: string,
): string {
  return applyCanonicalTaxonomyLabels(kind, key, {
    es: label,
    en: label,
  })[locale];
}

export function ensureUniqueTaxonomyItems(
  kind: TaxonomyKind,
  locale: TaxonomyLocale,
  items: NamedTaxonomyItem[],
): NamedTaxonomyItem[] {
  const canonicalItems = items.map((item) => ({
    ...item,
    name: applyCanonicalTaxonomyLabel(kind, item.key, locale, item.name),
  }));

  const groupedItems = new Map<string, NamedTaxonomyItem[]>();

  for (const item of canonicalItems) {
    const normalized = normalizeLabelForCollision(item.name);
    const group = groupedItems.get(normalized) ?? [];
    group.push(item);
    groupedItems.set(normalized, group);
  }

  return canonicalItems.map((item) => {
    const group = groupedItems.get(normalizeLabelForCollision(item.name)) ?? [];
    if (group.length <= 1) {
      return item;
    }

    return {
      ...item,
      name: `${item.name} (${humanizeTaxonomyKey(item.key)})`,
    };
  });
}

export function assertNoTaxonomyLabelCollisions(
  kind: TaxonomyKind,
  entries: TaxonomyCollisionEntry[],
  contextLabel: string,
): void {
  const collisions: string[] = [];

  for (const locale of ['es', 'en'] as const) {
    const labelsByName = new Map<string, Array<{ key: string; rowNumber?: number; label: string }>>();

    for (const entry of entries) {
      const canonicalLabels = applyCanonicalTaxonomyLabels(kind, entry.key, entry.labels);
      const label = canonicalLabels[locale];
      const normalized = normalizeLabelForCollision(label);
      const group = labelsByName.get(normalized) ?? [];
      group.push({
        key: entry.key,
        rowNumber: entry.rowNumber,
        label,
      });
      labelsByName.set(normalized, group);
    }

    for (const group of labelsByName.values()) {
      const uniqueKeys = [...new Set(group.map((item) => item.key))];
      if (uniqueKeys.length <= 1) {
        continue;
      }

      const rowNumbers = [...new Set(group.map((item) => item.rowNumber).filter((value) => value !== undefined))];
      const label = group[0]?.label ?? '';
      const rowDetails = rowNumbers.length > 0 ? ` (rows ${rowNumbers.join(', ')})` : '';

      collisions.push(
        `${locale.toUpperCase()} "${label}" -> keys ${uniqueKeys.join(', ')}${rowDetails}`,
      );
    }
  }

  if (collisions.length > 0) {
    throw new Error(
      `${contextLabel} contains duplicate localized labels after canonicalization: ${collisions.join('; ')}.`,
    );
  }
}
