-- Add NEWSLETTER_SUBSCRIBER to BadgeType enum
ALTER TYPE "BadgeType" ADD VALUE IF NOT EXISTS 'NEWSLETTER_SUBSCRIBER';

-- Insert newsletter badge
INSERT INTO "Badge" (id, type, name, description, icon, "xpReward", "createdAt")
VALUES (
  'newsletter_badge_001',
  'NEWSLETTER_SUBSCRIBER',
  'Bülten Abonesi',
  'E-bültene abone oldun!',
  '📬',
  50,
  NOW()
)
ON CONFLICT (type) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  "xpReward" = EXCLUDED."xpReward";
