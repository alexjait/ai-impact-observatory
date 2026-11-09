import { HttpStatus } from '@nestjs/common';

import { createAppException } from '../../shared/app-exception';

export const CONTRIBUTIONS_ERROR_CODES = {
  activityProposalNotFound: 'CONTRIBUTIONS_ACTIVITY_PROPOSAL_NOT_FOUND',
  activityProposalNotEditable: 'CONTRIBUTIONS_ACTIVITY_PROPOSAL_NOT_EDITABLE',
  evidenceProposalNotFound: 'CONTRIBUTIONS_EVIDENCE_PROPOSAL_NOT_FOUND',
  evidenceProposalNotEditable: 'CONTRIBUTIONS_EVIDENCE_PROPOSAL_NOT_EDITABLE',
  publicActivityNotFound: 'CONTRIBUTIONS_PUBLIC_ACTIVITY_NOT_FOUND',
  activityNotFound: 'CONTRIBUTIONS_ACTIVITY_NOT_FOUND',
  evidenceNotFound: 'CONTRIBUTIONS_EVIDENCE_NOT_FOUND',
  commentNotFound: 'CONTRIBUTIONS_COMMENT_NOT_FOUND',
  cannotReportOwnComment: 'CONTRIBUTIONS_CANNOT_REPORT_OWN_COMMENT',
  invalidIndustries: 'CONTRIBUTIONS_INVALID_INDUSTRIES',
  invalidCategories: 'CONTRIBUTIONS_INVALID_CATEGORIES',
  invalidActivities: 'CONTRIBUTIONS_INVALID_ACTIVITIES',
  parentCommentInvalid: 'CONTRIBUTIONS_PARENT_COMMENT_INVALID',
  onlyOneReplyLevelAllowed: 'CONTRIBUTIONS_ONLY_ONE_REPLY_LEVEL_ALLOWED',
  parentCommentEntityMismatch: 'CONTRIBUTIONS_PARENT_COMMENT_ENTITY_MISMATCH',
  commentTextRequired: 'CONTRIBUTIONS_COMMENT_TEXT_REQUIRED',
  evidenceTranslationRequired: 'CONTRIBUTIONS_EVIDENCE_TRANSLATION_REQUIRED',
  activityTranslationRequired: 'CONTRIBUTIONS_ACTIVITY_TRANSLATION_REQUIRED',
} as const;

export const contributionsErrors = {
  activityProposalNotFound: () =>
    createAppException(
      HttpStatus.NOT_FOUND,
      'Not Found',
      CONTRIBUTIONS_ERROR_CODES.activityProposalNotFound,
      'Activity proposal not found.',
    ),
  activityProposalNotEditable: () =>
    createAppException(
      HttpStatus.CONFLICT,
      'Conflict',
      CONTRIBUTIONS_ERROR_CODES.activityProposalNotEditable,
      'Only pending or correction-requested activity proposals can be edited.',
    ),
  evidenceProposalNotFound: () =>
    createAppException(
      HttpStatus.NOT_FOUND,
      'Not Found',
      CONTRIBUTIONS_ERROR_CODES.evidenceProposalNotFound,
      'Evidence proposal not found.',
    ),
  evidenceProposalNotEditable: () =>
    createAppException(
      HttpStatus.CONFLICT,
      'Conflict',
      CONTRIBUTIONS_ERROR_CODES.evidenceProposalNotEditable,
      'Only pending or correction-requested evidence proposals can be edited.',
    ),
  publicActivityNotFound: () =>
    createAppException(
      HttpStatus.NOT_FOUND,
      'Not Found',
      CONTRIBUTIONS_ERROR_CODES.publicActivityNotFound,
      'Public activity not found.',
    ),
  activityNotFound: () =>
    createAppException(
      HttpStatus.NOT_FOUND,
      'Not Found',
      CONTRIBUTIONS_ERROR_CODES.activityNotFound,
      'Activity not found.',
    ),
  evidenceNotFound: () =>
    createAppException(
      HttpStatus.NOT_FOUND,
      'Not Found',
      CONTRIBUTIONS_ERROR_CODES.evidenceNotFound,
      'Evidence not found.',
    ),
  commentNotFound: () =>
    createAppException(
      HttpStatus.NOT_FOUND,
      'Not Found',
      CONTRIBUTIONS_ERROR_CODES.commentNotFound,
      'Comment not found.',
    ),
  cannotReportOwnComment: () =>
    createAppException(
      HttpStatus.CONFLICT,
      'Conflict',
      CONTRIBUTIONS_ERROR_CODES.cannotReportOwnComment,
      'You cannot report your own comment.',
    ),
  invalidIndustries: () =>
    createAppException(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      CONTRIBUTIONS_ERROR_CODES.invalidIndustries,
      'One or more industries are invalid.',
    ),
  invalidCategories: () =>
    createAppException(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      CONTRIBUTIONS_ERROR_CODES.invalidCategories,
      'One or more categories are invalid.',
    ),
  invalidActivities: () =>
    createAppException(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      CONTRIBUTIONS_ERROR_CODES.invalidActivities,
      'One or more activities are invalid.',
    ),
  parentCommentInvalid: () =>
    createAppException(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      CONTRIBUTIONS_ERROR_CODES.parentCommentInvalid,
      'Parent comment is invalid.',
    ),
  onlyOneReplyLevelAllowed: () =>
    createAppException(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      CONTRIBUTIONS_ERROR_CODES.onlyOneReplyLevelAllowed,
      'Only one level of replies is allowed.',
    ),
  parentCommentEntityMismatch: () =>
    createAppException(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      CONTRIBUTIONS_ERROR_CODES.parentCommentEntityMismatch,
      'Parent comment must belong to the same entity.',
    ),
  commentTextRequired: () =>
    createAppException(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      CONTRIBUTIONS_ERROR_CODES.commentTextRequired,
      'Comment text is required.',
    ),
  evidenceTranslationRequired: () =>
    createAppException(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      CONTRIBUTIONS_ERROR_CODES.evidenceTranslationRequired,
      'Evidence translation payload is required.',
    ),
  activityTranslationRequired: () =>
    createAppException(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      CONTRIBUTIONS_ERROR_CODES.activityTranslationRequired,
      'Activity translation payload is required.',
    ),
} as const;
