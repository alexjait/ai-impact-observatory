import { HttpStatus } from '@nestjs/common';

import { createAppException } from '../../shared/app-exception';

export const MODERATION_ERROR_CODES = {
  unsupportedQueueType: 'MODERATION_UNSUPPORTED_QUEUE_TYPE',
  activityProposalNotFound: 'MODERATION_ACTIVITY_PROPOSAL_NOT_FOUND',
  evidenceProposalNotFound: 'MODERATION_EVIDENCE_PROPOSAL_NOT_FOUND',
  moderationReasonRequired: 'MODERATION_REASON_REQUIRED',
  commentNotFound: 'MODERATION_COMMENT_NOT_FOUND',
  materializedActivityNotFound: 'MODERATION_MATERIALIZED_ACTIVITY_NOT_FOUND',
  materializedEvidenceNotFound: 'MODERATION_MATERIALIZED_EVIDENCE_NOT_FOUND',
} as const;

export const moderationErrors = {
  unsupportedQueueType: () =>
    createAppException(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      MODERATION_ERROR_CODES.unsupportedQueueType,
      'Unsupported moderation queue type.',
    ),
  activityProposalNotFound: () =>
    createAppException(
      HttpStatus.NOT_FOUND,
      'Not Found',
      MODERATION_ERROR_CODES.activityProposalNotFound,
      'Activity proposal not found.',
    ),
  evidenceProposalNotFound: () =>
    createAppException(
      HttpStatus.NOT_FOUND,
      'Not Found',
      MODERATION_ERROR_CODES.evidenceProposalNotFound,
      'Evidence proposal not found.',
    ),
  moderationReasonRequired: () =>
    createAppException(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      MODERATION_ERROR_CODES.moderationReasonRequired,
      'Moderation reason is required.',
    ),
  commentNotFound: () =>
    createAppException(
      HttpStatus.NOT_FOUND,
      'Not Found',
      MODERATION_ERROR_CODES.commentNotFound,
      'Comment not found.',
    ),
  materializedActivityNotFound: () =>
    createAppException(
      HttpStatus.NOT_FOUND,
      'Not Found',
      MODERATION_ERROR_CODES.materializedActivityNotFound,
      'Materialized activity not found for approved proposal.',
    ),
  materializedEvidenceNotFound: () =>
    createAppException(
      HttpStatus.NOT_FOUND,
      'Not Found',
      MODERATION_ERROR_CODES.materializedEvidenceNotFound,
      'Materialized evidence not found for approved proposal.',
    ),
} as const;
