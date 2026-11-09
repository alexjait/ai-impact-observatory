import { type Locale, localized } from "./site";

type ApiErrorPayload = {
  code?: string;
  message?: string | string[];
};

const PASSWORD_COMPLEXITY_MESSAGE =
  "Password must be at least 8 characters long and include uppercase, lowercase, and a number.";

const API_ERROR_MESSAGES: Record<string, { en: string; es: string }> = {
  AUTH_CAPTCHA_VALIDATION_NOT_CONFIGURED: {
    en: "Security verification is not configured in this environment.",
    es: "La verificacion de seguridad no esta configurada en este entorno.",
  },
  AUTH_CAPTCHA_VALIDATION_FAILED: {
    en: "Security verification failed. Please try again.",
    es: "La verificacion de seguridad fallo. Intentalo de nuevo.",
  },
  AUTH_CAPTCHA_VALIDATION_UNAVAILABLE: {
    en: "Security verification is temporarily unavailable. Please try again.",
    es: "La verificacion de seguridad no esta disponible temporalmente. Intentalo de nuevo.",
  },
  AUTH_REGISTER_TERMS_REQUIRED: {
    en: "You need to accept the terms to create an account.",
    es: "Necesitas aceptar los terminos para crear una cuenta.",
  },
  AUTH_REGISTER_EMAIL_ALREADY_REGISTERED: {
    en: "That email is already registered.",
    es: "Ese email ya esta registrado.",
  },
  AUTH_INVALID_CREDENTIALS: {
    en: "The email or password is not correct.",
    es: "El email o la contrasena no son correctos.",
  },
  AUTH_EMAIL_NOT_VERIFIED: {
    en: "Verify your email before signing in.",
    es: "Verifica tu email antes de ingresar.",
  },
  AUTH_PASSWORD_RESET_TOKEN_INVALID: {
    en: "That password reset link is invalid or expired.",
    es: "Ese enlace para restablecer la contrasena es invalido o vencio.",
  },
  AUTH_GOOGLE_CALLBACK_MISSING_PARAMS: {
    en: "Google sign-in could not be completed.",
    es: "No se pudo completar el ingreso con Google.",
  },
  AUTH_GOOGLE_EMAIL_MISSING: {
    en: "Your Google account did not provide an email address.",
    es: "Tu cuenta de Google no proporciono una direccion de email.",
  },
  AUTH_GOOGLE_EMAIL_NOT_VERIFIED: {
    en: "Your Google account email must be verified before continuing.",
    es: "El email de tu cuenta de Google debe estar verificado antes de continuar.",
  },
  AUTH_SOCIAL_SIGNUP_TERMS_REQUIRED: {
    en: "You need to accept the terms to finish signup.",
    es: "Necesitas aceptar los terminos para completar el alta.",
  },
  AUTH_SOCIAL_SIGNUP_CONTEXT_MISSING: {
    en: "The social signup session is missing. Please start again.",
    es: "Falta el contexto del alta social. Volve a empezar.",
  },
  AUTH_SOCIAL_SIGNUP_CONTEXT_INVALID: {
    en: "The social signup session is invalid or expired. Please start again.",
    es: "La sesion de alta social es invalida o vencio. Volve a empezar.",
  },
  AUTH_EMAIL_VERIFICATION_TOKEN_INVALID: {
    en: "That email verification link is invalid or expired.",
    es: "Ese enlace de verificacion es invalido o vencio.",
  },
  AUTH_GOOGLE_SIGN_IN_NOT_CONFIGURED: {
    en: "Google sign-in is not configured in this environment.",
    es: "Google Sign-In no esta configurado en este entorno.",
  },
  AUTH_USER_NOT_FOUND: {
    en: "We could not find that account.",
    es: "No pudimos encontrar esa cuenta.",
  },
  AUTH_FLOW_STATE_INVALID: {
    en: "This authentication step is invalid or expired. Please start again.",
    es: "Este paso de autenticacion es invalido o vencio. Volve a empezar.",
  },
  AUTH_GOOGLE_TOKEN_EXCHANGE_FAILED: {
    en: "Google sign-in could not be completed.",
    es: "No se pudo completar el ingreso con Google.",
  },
  AUTH_GOOGLE_ACCESS_TOKEN_MISSING: {
    en: "Google sign-in could not be completed.",
    es: "No se pudo completar el ingreso con Google.",
  },
  AUTH_GOOGLE_PROFILE_FETCH_FAILED: {
    en: "Google sign-in could not be completed.",
    es: "No se pudo completar el ingreso con Google.",
  },
  AUTH_EMAIL_DELIVERY_NOT_CONFIGURED: {
    en: "Email delivery is not configured in this environment.",
    es: "El envio de emails no esta configurado en este entorno.",
  },
  AUTH_VERIFICATION_EMAIL_SEND_FAILED: {
    en: "We could not send the verification email. Please try again.",
    es: "No pudimos enviar el email de verificacion. Intentalo de nuevo.",
  },
  AUTH_WELCOME_EMAIL_SEND_FAILED: {
    en: "We could not send the welcome email. Please try again.",
    es: "No pudimos enviar el email de bienvenida. Intentalo de nuevo.",
  },
  AUTH_PASSWORD_RESET_EMAIL_SEND_FAILED: {
    en: "We could not send the password reset email. Please try again.",
    es: "No pudimos enviar el email para restablecer la contrasena. Intentalo de nuevo.",
  },
  SHARED_AUTHENTICATION_REQUIRED: {
    en: "You need to sign in to continue.",
    es: "Necesitas iniciar sesion para continuar.",
  },
  SHARED_SESSION_INVALID: {
    en: "Your session expired. Sign in again to continue.",
    es: "Tu sesion vencio. Inicia sesion de nuevo para continuar.",
  },
  SHARED_MISSING_AUTHENTICATED_USER_CONTEXT: {
    en: "Your session could not be validated for this action.",
    es: "No se pudo validar tu sesion para esta accion.",
  },
  SHARED_PERMISSION_DENIED: {
    en: "You do not have permission to do that.",
    es: "No tienes permiso para hacer eso.",
  },
  PUBLIC_ACTIVITY_NOT_FOUND: {
    en: "We could not find that activity.",
    es: "No pudimos encontrar esa actividad.",
  },
  PUBLIC_EVIDENCE_NOT_FOUND: {
    en: "We could not find that evidence item.",
    es: "No pudimos encontrar esa evidencia.",
  },
  CONTACT_MESSAGE_NOT_FOUND: {
    en: "That contact message no longer exists.",
    es: "Ese mensaje de contacto ya no existe.",
  },
  CONTRIBUTIONS_ACTIVITY_PROPOSAL_NOT_FOUND: {
    en: "We could not find that activity proposal.",
    es: "No pudimos encontrar esa propuesta de actividad.",
  },
  CONTRIBUTIONS_ACTIVITY_PROPOSAL_NOT_EDITABLE: {
    en: "Only pending or correction-requested activity proposals can be edited.",
    es: "Solo se pueden editar propuestas de actividad pendientes o con correccion solicitada.",
  },
  CONTRIBUTIONS_EVIDENCE_PROPOSAL_NOT_FOUND: {
    en: "We could not find that evidence proposal.",
    es: "No pudimos encontrar esa propuesta de evidencia.",
  },
  CONTRIBUTIONS_EVIDENCE_PROPOSAL_NOT_EDITABLE: {
    en: "Only pending or correction-requested evidence proposals can be edited.",
    es: "Solo se pueden editar propuestas de evidencia pendientes o con correccion solicitada.",
  },
  CONTRIBUTIONS_PUBLIC_ACTIVITY_NOT_FOUND: {
    en: "That public activity is no longer available.",
    es: "Esa actividad publica ya no esta disponible.",
  },
  CONTRIBUTIONS_ACTIVITY_NOT_FOUND: {
    en: "We could not find that activity.",
    es: "No pudimos encontrar esa actividad.",
  },
  CONTRIBUTIONS_EVIDENCE_NOT_FOUND: {
    en: "We could not find that evidence item.",
    es: "No pudimos encontrar esa evidencia.",
  },
  CONTRIBUTIONS_COMMENT_NOT_FOUND: {
    en: "We could not find that comment.",
    es: "No pudimos encontrar ese comentario.",
  },
  CONTRIBUTIONS_CANNOT_REPORT_OWN_COMMENT: {
    en: "You cannot report your own comment.",
    es: "No puedes denunciar tu propio comentario.",
  },
  CONTRIBUTIONS_INVALID_INDUSTRIES: {
    en: "One or more selected industries are invalid.",
    es: "Uno o mas rubros seleccionados no son validos.",
  },
  CONTRIBUTIONS_INVALID_CATEGORIES: {
    en: "One or more selected categories are invalid.",
    es: "Una o mas categorias seleccionadas no son validas.",
  },
  CONTRIBUTIONS_INVALID_ACTIVITIES: {
    en: "One or more selected activities are invalid.",
    es: "Una o mas actividades seleccionadas no son validas.",
  },
  CONTRIBUTIONS_PARENT_COMMENT_INVALID: {
    en: "The parent comment is no longer valid for replying.",
    es: "El comentario padre ya no es valido para responder.",
  },
  CONTRIBUTIONS_ONLY_ONE_REPLY_LEVEL_ALLOWED: {
    en: "Only one level of replies is allowed.",
    es: "Solo se permite un nivel de respuestas.",
  },
  CONTRIBUTIONS_PARENT_COMMENT_ENTITY_MISMATCH: {
    en: "The reply must belong to the same activity or evidence item.",
    es: "La respuesta debe pertenecer a la misma actividad o evidencia.",
  },
  CONTRIBUTIONS_COMMENT_TEXT_REQUIRED: {
    en: "Write some text before publishing the comment.",
    es: "Escribe algo antes de publicar el comentario.",
  },
  CONTRIBUTIONS_EVIDENCE_TRANSLATION_REQUIRED: {
    en: "The bilingual evidence content is incomplete.",
    es: "El contenido bilingue de la evidencia esta incompleto.",
  },
  CONTRIBUTIONS_ACTIVITY_TRANSLATION_REQUIRED: {
    en: "The bilingual activity content is incomplete.",
    es: "El contenido bilingue de la actividad esta incompleto.",
  },
  MODERATION_UNSUPPORTED_QUEUE_TYPE: {
    en: "That moderation queue is not available.",
    es: "Esa cola de moderacion no esta disponible.",
  },
  MODERATION_ACTIVITY_PROPOSAL_NOT_FOUND: {
    en: "We could not find that activity proposal.",
    es: "No pudimos encontrar esa propuesta de actividad.",
  },
  MODERATION_EVIDENCE_PROPOSAL_NOT_FOUND: {
    en: "We could not find that evidence proposal.",
    es: "No pudimos encontrar esa propuesta de evidencia.",
  },
  MODERATION_REASON_REQUIRED: {
    en: "Write a moderation rationale before continuing.",
    es: "Escribe un fundamento de moderacion antes de continuar.",
  },
  MODERATION_COMMENT_NOT_FOUND: {
    en: "We could not find that comment.",
    es: "No pudimos encontrar ese comentario.",
  },
  MODERATION_MATERIALIZED_ACTIVITY_NOT_FOUND: {
    en: "The approved activity record could not be found.",
    es: "No se encontro el registro de actividad aprobado.",
  },
  MODERATION_MATERIALIZED_EVIDENCE_NOT_FOUND: {
    en: "The approved evidence record could not be found.",
    es: "No se encontro el registro de evidencia aprobado.",
  },
  EDITORIAL_ACTIVITY_NOT_FOUND: {
    en: "We could not find that activity.",
    es: "No pudimos encontrar esa actividad.",
  },
  EDITORIAL_EVIDENCE_NOT_FOUND: {
    en: "We could not find that evidence item.",
    es: "No pudimos encontrar esa evidencia.",
  },
  EDITORIAL_RATIONALE_REQUIRED: {
    en: "Write an editorial rationale before continuing.",
    es: "Escribe un fundamento editorial antes de continuar.",
  },
  EDITORIAL_BILINGUAL_TITLES_REQUIRED: {
    en: "English and Spanish titles are required.",
    es: "Se requieren titulos en ingles y espanol.",
  },
  EDITORIAL_BILINGUAL_SLUGS_REQUIRED: {
    en: "English and Spanish slugs are required.",
    es: "Se requieren slugs en ingles y espanol.",
  },
  EDITORIAL_RELIABILITY_RATIONALE_REQUIRED: {
    en: "Write a reliability rationale before continuing.",
    es: "Escribe un fundamento de confiabilidad antes de continuar.",
  },
  EDITORIAL_INVALID_INDUSTRIES: {
    en: "One or more selected industries do not exist.",
    es: "Uno o mas rubros seleccionados no existen.",
  },
  EDITORIAL_INVALID_CATEGORIES: {
    en: "One or more selected categories do not exist.",
    es: "Una o mas categorias seleccionadas no existen.",
  },
  EDITORIAL_BILINGUAL_EVIDENCE_CONTENT_REQUIRED: {
    en: "English and Spanish evidence content is required.",
    es: "Se requiere contenido de evidencia en ingles y espanol.",
  },
  EDITORIAL_SOURCE_TEXT_REQUIRED: {
    en: "Source text is required.",
    es: "La fuente textual es obligatoria.",
  },
  EDITORIAL_INVALID_RELATED_ACTIVITIES: {
    en: "One or more related activities do not exist.",
    es: "Una o mas actividades relacionadas no existen.",
  },
  EDITORIAL_ACTIVITY_SLUG_IN_USE: {
    en: "One of the submitted activity slugs is already in use.",
    es: "Uno de los slugs de actividad enviados ya esta en uso.",
  },
  EDITORIAL_EVIDENCE_SLUG_IN_USE: {
    en: "One of the submitted evidence slugs is already in use.",
    es: "Uno de los slugs de evidencia enviados ya esta en uso.",
  },
};

const RAW_MESSAGE_OVERRIDES: Record<string, { en: string; es: string }> = {
  "Invalid credentials.": API_ERROR_MESSAGES.AUTH_INVALID_CREDENTIALS,
  "Verify your email before signing in.": API_ERROR_MESSAGES.AUTH_EMAIL_NOT_VERIFIED,
  "Captcha validation is not configured.":
    API_ERROR_MESSAGES.AUTH_CAPTCHA_VALIDATION_NOT_CONFIGURED,
  "Captcha validation failed.": API_ERROR_MESSAGES.AUTH_CAPTCHA_VALIDATION_FAILED,
  "Captcha validation is temporarily unavailable.":
    API_ERROR_MESSAGES.AUTH_CAPTCHA_VALIDATION_UNAVAILABLE,
  "Terms must be accepted to register.": API_ERROR_MESSAGES.AUTH_REGISTER_TERMS_REQUIRED,
  "Email is already registered.":
    API_ERROR_MESSAGES.AUTH_REGISTER_EMAIL_ALREADY_REGISTERED,
  "Password reset token is invalid or expired.":
    API_ERROR_MESSAGES.AUTH_PASSWORD_RESET_TOKEN_INVALID,
  "Terms must be accepted to complete social signup.":
    API_ERROR_MESSAGES.AUTH_SOCIAL_SIGNUP_TERMS_REQUIRED,
  "Missing social signup context.":
    API_ERROR_MESSAGES.AUTH_SOCIAL_SIGNUP_CONTEXT_MISSING,
  "Invalid social signup context.":
    API_ERROR_MESSAGES.AUTH_SOCIAL_SIGNUP_CONTEXT_INVALID,
  "Email verification token is invalid or expired.":
    API_ERROR_MESSAGES.AUTH_EMAIL_VERIFICATION_TOKEN_INVALID,
  "Google sign-in is not configured.":
    API_ERROR_MESSAGES.AUTH_GOOGLE_SIGN_IN_NOT_CONFIGURED,
  "Authentication required.": API_ERROR_MESSAGES.SHARED_AUTHENTICATION_REQUIRED,
  "Session is invalid or expired.": API_ERROR_MESSAGES.SHARED_SESSION_INVALID,
  "Missing authenticated user context.":
    API_ERROR_MESSAGES.SHARED_MISSING_AUTHENTICATED_USER_CONTEXT,
  "You do not have permission to access this resource.":
    API_ERROR_MESSAGES.SHARED_PERMISSION_DENIED,
  "Activity not found.": API_ERROR_MESSAGES.EDITORIAL_ACTIVITY_NOT_FOUND,
  "Evidence not found.": API_ERROR_MESSAGES.EDITORIAL_EVIDENCE_NOT_FOUND,
  "Contact message was not found.": API_ERROR_MESSAGES.CONTACT_MESSAGE_NOT_FOUND,
  "Public activity not found.": API_ERROR_MESSAGES.CONTRIBUTIONS_PUBLIC_ACTIVITY_NOT_FOUND,
  "Activity proposal not found.": API_ERROR_MESSAGES.CONTRIBUTIONS_ACTIVITY_PROPOSAL_NOT_FOUND,
  "Evidence proposal not found.": API_ERROR_MESSAGES.CONTRIBUTIONS_EVIDENCE_PROPOSAL_NOT_FOUND,
  "Comment not found.": API_ERROR_MESSAGES.CONTRIBUTIONS_COMMENT_NOT_FOUND,
  "You cannot report your own comment.":
    API_ERROR_MESSAGES.CONTRIBUTIONS_CANNOT_REPORT_OWN_COMMENT,
  "One or more industries are invalid.": API_ERROR_MESSAGES.CONTRIBUTIONS_INVALID_INDUSTRIES,
  "One or more categories are invalid.": API_ERROR_MESSAGES.CONTRIBUTIONS_INVALID_CATEGORIES,
  "One or more activities are invalid.": API_ERROR_MESSAGES.CONTRIBUTIONS_INVALID_ACTIVITIES,
  "Parent comment is invalid.": API_ERROR_MESSAGES.CONTRIBUTIONS_PARENT_COMMENT_INVALID,
  "Only one level of replies is allowed.":
    API_ERROR_MESSAGES.CONTRIBUTIONS_ONLY_ONE_REPLY_LEVEL_ALLOWED,
  "Parent comment must belong to the same entity.":
    API_ERROR_MESSAGES.CONTRIBUTIONS_PARENT_COMMENT_ENTITY_MISMATCH,
  "Comment text is required.": API_ERROR_MESSAGES.CONTRIBUTIONS_COMMENT_TEXT_REQUIRED,
  "Evidence translation payload is required.":
    API_ERROR_MESSAGES.CONTRIBUTIONS_EVIDENCE_TRANSLATION_REQUIRED,
  "Activity translation payload is required.":
    API_ERROR_MESSAGES.CONTRIBUTIONS_ACTIVITY_TRANSLATION_REQUIRED,
  "Unsupported moderation queue type.": API_ERROR_MESSAGES.MODERATION_UNSUPPORTED_QUEUE_TYPE,
  "Moderation reason is required.": API_ERROR_MESSAGES.MODERATION_REASON_REQUIRED,
  "Materialized activity not found for approved proposal.":
    API_ERROR_MESSAGES.MODERATION_MATERIALIZED_ACTIVITY_NOT_FOUND,
  "Materialized evidence not found for approved proposal.":
    API_ERROR_MESSAGES.MODERATION_MATERIALIZED_EVIDENCE_NOT_FOUND,
  "Editorial rationale is required.": API_ERROR_MESSAGES.EDITORIAL_RATIONALE_REQUIRED,
  "Bilingual titles are required.": API_ERROR_MESSAGES.EDITORIAL_BILINGUAL_TITLES_REQUIRED,
  "Bilingual slugs are required.": API_ERROR_MESSAGES.EDITORIAL_BILINGUAL_SLUGS_REQUIRED,
  "Reliability rationale is required.":
    API_ERROR_MESSAGES.EDITORIAL_RELIABILITY_RATIONALE_REQUIRED,
  "One or more selected industries do not exist.":
    API_ERROR_MESSAGES.EDITORIAL_INVALID_INDUSTRIES,
  "One or more selected categories do not exist.":
    API_ERROR_MESSAGES.EDITORIAL_INVALID_CATEGORIES,
  "Bilingual evidence content is required.":
    API_ERROR_MESSAGES.EDITORIAL_BILINGUAL_EVIDENCE_CONTENT_REQUIRED,
  "Source text is required.": API_ERROR_MESSAGES.EDITORIAL_SOURCE_TEXT_REQUIRED,
  "One or more related activities do not exist.":
    API_ERROR_MESSAGES.EDITORIAL_INVALID_RELATED_ACTIVITIES,
  "One of the updated slugs is already in use by another activity.":
    API_ERROR_MESSAGES.EDITORIAL_ACTIVITY_SLUG_IN_USE,
  "One of the submitted slugs is already in use by another activity.":
    API_ERROR_MESSAGES.EDITORIAL_ACTIVITY_SLUG_IN_USE,
  "One of the submitted slugs is already in use by another evidence item.":
    API_ERROR_MESSAGES.EDITORIAL_EVIDENCE_SLUG_IN_USE,
  [PASSWORD_COMPLEXITY_MESSAGE]: {
    en: PASSWORD_COMPLEXITY_MESSAGE,
    es: "La contrasena debe tener al menos 8 caracteres e incluir mayuscula, minuscula y un numero.",
  },
  "email must be an email": {
    en: "Enter a valid email address.",
    es: "Ingresa un email valido.",
  },
  "name must be longer than or equal to 2 characters": {
    en: "Name must be at least 2 characters long.",
    es: "El nombre debe tener al menos 2 caracteres.",
  },
  "name must be shorter than or equal to 120 characters": {
    en: "Name must be 120 characters or fewer.",
    es: "El nombre debe tener 120 caracteres o menos.",
  },
  "email must be shorter than or equal to 160 characters": {
    en: "Email must be 160 characters or fewer.",
    es: "El email debe tener 160 caracteres o menos.",
  },
  "subject must be shorter than or equal to 160 characters": {
    en: "Subject must be 160 characters or fewer.",
    es: "El asunto debe tener 160 caracteres o menos.",
  },
  "password must be longer than or equal to 8 characters": {
    en: "Password must be at least 8 characters long.",
    es: "La contrasena debe tener al menos 8 caracteres.",
  },
  "newPassword must be longer than or equal to 8 characters": {
    en: "Password must be at least 8 characters long.",
    es: "La contrasena debe tener al menos 8 caracteres.",
  },
  "message must be longer than or equal to 10 characters": {
    en: "Message must be at least 10 characters long.",
    es: "El mensaje debe tener al menos 10 caracteres.",
  },
  "message must be shorter than or equal to 4000 characters": {
    en: "Message must be 4000 characters or fewer.",
    es: "El mensaje debe tener 4000 caracteres o menos.",
  },
  "captchaToken must be longer than or equal to 1 characters": {
    en: "Complete the security verification before continuing.",
    es: "Completa la verificacion de seguridad antes de continuar.",
  },
  "captchaToken must be shorter than or equal to 2048 characters": {
    en: "Security verification must be completed again.",
    es: "La verificacion de seguridad debe completarse de nuevo.",
  },
  "locale must be one of the following values: en, es": {
    en: "Choose a valid language.",
    es: "Elige un idioma valido.",
  },
  "termsAccepted must be a boolean value": {
    en: "Terms acceptance could not be validated.",
    es: "No se pudo validar la aceptacion de terminos.",
  },
};

function translateRawMessage(message: string, locale: Locale): string | null {
  const translated = RAW_MESSAGE_OVERRIDES[message];
  return translated ? localized(locale, translated) : null;
}

export function resolveApiErrorPayloadMessage(
  payload: ApiErrorPayload | null | undefined,
  locale: Locale,
  fallbackMessage: string,
): string {
  if (payload?.code && API_ERROR_MESSAGES[payload.code]) {
    return localized(locale, API_ERROR_MESSAGES[payload.code]);
  }

  if (Array.isArray(payload?.message)) {
    return payload.message
      .map((message) => translateRawMessage(message, locale) ?? message)
      .join(" ");
  }

  if (typeof payload?.message === "string") {
    return translateRawMessage(payload.message, locale) ?? payload.message;
  }

  return fallbackMessage;
}

export async function resolveApiErrorMessage(
  response: Response,
  locale: Locale,
  fallbackMessage: string,
): Promise<string> {
  const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;
  return resolveApiErrorPayloadMessage(payload, locale, fallbackMessage);
}

export const resolveAuthErrorMessage = resolveApiErrorMessage;
