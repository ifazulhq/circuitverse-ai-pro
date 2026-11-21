-- AlterTable
ALTER TABLE "users" ADD COLUMN     "aiAssistantUsedThisMonth" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "aiGenerationUsedThisMonth" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "aiUsageResetAt" TIMESTAMP(3),
ADD COLUMN     "preferences" JSONB;
