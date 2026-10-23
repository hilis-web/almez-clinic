
-- Add the new fields as nullable first to preserve existing records.
ALTER TABLE "consultation_requests"
ADD COLUMN "consultation_type" VARCHAR(50);

ALTER TABLE "consultation_requests"
ADD COLUMN "additional_info" TEXT;

-- Preserve existing requests with an explicit legacy value.
UPDATE "consultation_requests"
SET "consultation_type" = 'other'
WHERE "consultation_type" IS NULL;

-- New and existing records must have a consultation type.
ALTER TABLE "consultation_requests"
ALTER COLUMN "consultation_type" SET NOT NULL;

-- The original form does not require a separate message field.
ALTER TABLE "consultation_requests"
ALTER COLUMN "message" DROP NOT NULL;