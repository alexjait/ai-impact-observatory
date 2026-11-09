import { Injectable } from '@nestjs/common';

import { env } from '../../shared/env';

type TranslationLocale = 'en' | 'es';

@Injectable()
export class TranslationService {
  async buildBilingualActivityTranslations(input: {
    locale: TranslationLocale;
    title: string;
    shortDescription?: string | null;
    fullDescription?: string | null;
  }) {
    const source = input.locale;
    const target = source === 'en' ? 'es' : 'en';

    const [translatedTitle, translatedShortDescription, translatedFullDescription] =
      await Promise.all([
        this.translateText(input.title, source, target),
        this.translateText(input.shortDescription ?? '', source, target),
        this.translateText(input.fullDescription ?? '', source, target),
      ]);

    const sourcePayload = {
      title: input.title.trim(),
      shortDescription: input.shortDescription?.trim() || null,
      fullDescription: input.fullDescription?.trim() || null,
    };

    const targetPayload = {
      title: translatedTitle,
      shortDescription: translatedShortDescription || null,
      fullDescription: translatedFullDescription || null,
    };

    return source === 'en'
      ? { en: sourcePayload, es: targetPayload }
      : { es: sourcePayload, en: targetPayload };
  }

  async buildBilingualEvidenceTranslations(input: {
    locale: TranslationLocale;
    title: string;
    summary: string;
    context: string;
  }) {
    const source = input.locale;
    const target = source === 'en' ? 'es' : 'en';

    const translated = await Promise.all([
      this.translateText(input.title, source, target),
      this.translateText(input.summary, source, target),
      this.translateText(input.context, source, target),
    ]);

    const sourcePayload = {
      title: input.title.trim(),
      summary: input.summary.trim(),
      context: input.context.trim(),
    };

    const targetPayload = {
      title: translated[0],
      summary: translated[1],
      context: translated[2],
    };

    return source === 'en'
      ? { en: sourcePayload, es: targetPayload }
      : { es: sourcePayload, en: targetPayload };
  }

  private async translateText(
    text: string,
    source: TranslationLocale,
    target: TranslationLocale,
  ) {
    const normalized = text.trim();

    if (!normalized) {
      return '';
    }

    try {
      switch (env.translationProvider) {
        case 'none':
          return normalized;
        case 'libretranslate':
          return await this.translateWithLibreTranslate(normalized, source, target);
        case 'mymemory':
        default:
          return await this.translateWithMyMemory(normalized, source, target);
      }
    } catch {
      return normalized;
    }
  }

  private async translateWithMyMemory(
    text: string,
    source: TranslationLocale,
    target: TranslationLocale,
  ) {
    const url = new URL('/get', env.translationApiBaseUrl);
    url.searchParams.set('q', text);
    url.searchParams.set('langpair', `${source}|${target}`);
    url.searchParams.set('mt', '1');

    if (env.translationContactEmail) {
      url.searchParams.set('de', env.translationContactEmail);
    }

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`MyMemory translation failed with status ${response.status}.`);
    }

    const body = (await response.json()) as
      | {
          responseData?: {
            translatedText?: string;
          };
        }
      | null;

    const translated = body?.responseData?.translatedText?.trim();
    if (!translated) {
      throw new Error('MyMemory translation returned an empty value.');
    }

    return translated;
  }

  private async translateWithLibreTranslate(
    text: string,
    source: TranslationLocale,
    target: TranslationLocale,
  ) {
    const url = new URL('/translate', env.translationApiBaseUrl);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source,
        target,
      }),
    });

    if (!response.ok) {
      throw new Error(`LibreTranslate failed with status ${response.status}.`);
    }

    const body = (await response.json()) as
      | {
          translatedText?: string;
        }
      | null;

    const translated = body?.translatedText?.trim();
    if (!translated) {
      throw new Error('LibreTranslate returned an empty value.');
    }

    return translated;
  }
}
