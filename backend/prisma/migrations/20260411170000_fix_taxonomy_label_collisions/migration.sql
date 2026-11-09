UPDATE "IndustryTranslation"
SET "name" = CASE
  WHEN "locale" = 'es' THEN 'Medios y contenidos'
  WHEN "locale" = 'en' THEN 'Media and content'
  ELSE "name"
END
WHERE "industryId" = (
  SELECT "id"
  FROM "Industry"
  WHERE "key" = 'media-content'
);

UPDATE "FunctionalCategoryTranslation"
SET "name" = CASE
  WHEN "locale" = 'es' THEN 'Operaciones de construcción e ingeniería'
  WHEN "locale" = 'en' THEN 'Construction and engineering operations'
  ELSE "name"
END
WHERE "functionalCategoryId" = (
  SELECT "id"
  FROM "FunctionalCategory"
  WHERE "key" = 'construction-engineering-operations'
);

UPDATE "FunctionalCategoryTranslation"
SET "name" = CASE
  WHEN "locale" = 'es' THEN 'Seguridad, riesgo e investigación'
  WHEN "locale" = 'en' THEN 'Security, risk, and investigation'
  ELSE "name"
END
WHERE "functionalCategoryId" = (
  SELECT "id"
  FROM "FunctionalCategory"
  WHERE "key" = 'security-risk-investigation'
);
