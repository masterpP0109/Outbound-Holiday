-- Repoint the moved public logo while preserving all other edited content.
BEGIN;
UPDATE "Content"
SET "payload" = replace("payload"::text, '"/images/logo/outbound-holidays-logo.webp"', '"/logo/outbound-holidays-logo.webp"')::jsonb,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE strpos("payload"::text, '"/images/logo/outbound-holidays-logo.webp"') > 0;
UPDATE "Content"
SET "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" IN (SELECT "contentId" FROM "Media" WHERE "url" = '/images/logo/outbound-holidays-logo.webp');
UPDATE "Media" SET "url" = '/logo/outbound-holidays-logo.webp'
WHERE "url" = '/images/logo/outbound-holidays-logo.webp';
COMMIT;
