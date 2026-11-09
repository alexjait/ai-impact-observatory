import { HttpStatus } from '@nestjs/common';

import { createAppException } from '../../shared/app-exception';

export const EDITORIAL_ERROR_CODES = {
  activityNotFound: 'EDITORIAL_ACTIVITY_NOT_FOUND',
  evidenceNotFound: 'EDITORIAL_EVIDENCE_NOT_FOUND',
  editorialRationaleRequired: 'EDITORIAL_RATIONALE_REQUIRED',
  bilingualTitlesRequired: 'EDITORIAL_BILINGUAL_TITLES_REQUIRED',
  bilingualSlugsRequired: 'EDITORIAL_BILINGUAL_SLUGS_REQUIRED',
  reliabilityRationaleRequired: 'EDITORIAL_RELIABILITY_RATIONALE_REQUIRED',
  invalidIndustries: 'EDITORIAL_INVALID_INDUSTRIES',
  invalidCategories: 'EDITORIAL_INVALID_CATEGORIES',
  bilingualEvidenceContentRequired: 'EDITORIAL_BILINGUAL_EVIDENCE_CONTENT_REQUIRED',
  sourceTextRequired: 'EDITORIAL_SOURCE_TEXT_REQUIRED',
  invalidRelatedActivities: 'EDITORIAL_INVALID_RELATED_ACTIVITIES',
  activitySlugInUse: 'EDITORIAL_ACTIVITY_SLUG_IN_USE',
  evidenceSlugInUse: 'EDITORIAL_EVIDENCE_SLUG_IN_USE',
} as const;

export const editorialErrors = {
  activityNotFound: () =>
    createAppException(
      HttpStatus.NOT_FOUND,
      'Not Found',
      EDITORIAL_ERROR_CODES.activityNotFound,
      'Activity not found.',
    ),
  evidenceNotFound: () =>
    createAppException(
      HttpStatus.NOT_FOUND,
      'Not Found',
      EDITORIAL_ERROR_CODES.evidenceNotFound,
      'Evidence not found.',
    ),
  editorialRationaleRequired: () =>
    createAppException(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      EDITORIAL_ERROR_CODES.editorialRationaleRequired,
      'Editorial rationale is required.',
    ),
  bilingualTitlesRequired: () =>
    createAppException(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      EDITORIAL_ERROR_CODES.bilingualTitlesRequired,
      'Bilingual titles are required.',
    ),
  bilingualSlugsRequired: () =>
    createAppException(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      EDITORIAL_ERROR_CODES.bilingualSlugsRequired,
      'Bilingual slugs are required.',
    ),
  reliabilityRationaleRequired: () =>
    createAppException(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      EDITORIAL_ERROR_CODES.reliabilityRationaleRequired,
      'Reliability rationale is required.',
    ),
  invalidIndustries: () =>
    createAppException(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      EDITORIAL_ERROR_CODES.invalidIndustries,
      'One or more selected industries do not exist.',
    ),
  invalidCategories: () =>
    createAppException(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      EDITORIAL_ERROR_CODES.invalidCategories,
      'One or more selected categories do not exist.',
    ),
  bilingualEvidenceContentRequired: () =>
    createAppException(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      EDITORIAL_ERROR_CODES.bilingualEvidenceContentRequired,
      'Bilingual evidence content is required.',
    ),
  sourceTextRequired: () =>
    createAppException(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      EDITORIAL_ERROR_CODES.sourceTextRequired,
      'Source text is required.',
    ),
  invalidRelatedActivities: () =>
    createAppException(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      EDITORIAL_ERROR_CODES.invalidRelatedActivities,
      'One or more related activities do not exist.',
    ),
  activitySlugInUse: () =>
    createAppException(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      EDITORIAL_ERROR_CODES.activitySlugInUse,
      'One of the submitted slugs is already in use by another activity.',
    ),
  evidenceSlugInUse: () =>
    createAppException(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      EDITORIAL_ERROR_CODES.evidenceSlugInUse,
      'One of the submitted slugs is already in use by another evidence item.',
    ),
} as const;
