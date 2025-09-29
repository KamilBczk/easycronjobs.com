/*
  Warnings:

  - You are about to drop the column `emailTo` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `headers` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `notifyOnFail` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `notifyOnOk` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `payload` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `retryDelayMs` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `schedule` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `targetUrl` on the `Job` table. All the data in the column will be lost.
  - Added the required column `apiUrl` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Job" DROP COLUMN "emailTo",
DROP COLUMN "headers",
DROP COLUMN "method",
DROP COLUMN "notifyOnFail",
DROP COLUMN "notifyOnOk",
DROP COLUMN "payload",
DROP COLUMN "retryDelayMs",
DROP COLUMN "schedule",
DROP COLUMN "targetUrl",
ADD COLUMN     "allowedDays" JSONB,
ADD COLUMN     "allowedTimeEnd" TEXT,
ADD COLUMN     "allowedTimeStart" TEXT,
ADD COLUMN     "apiAuth" JSONB,
ADD COLUMN     "apiBody" TEXT,
ADD COLUMN     "apiBodyType" TEXT NOT NULL DEFAULT 'json',
ADD COLUMN     "apiFailureCodes" JSONB,
ADD COLUMN     "apiFollowRedirects" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "apiHeaders" JSONB,
ADD COLUMN     "apiMethod" TEXT NOT NULL DEFAULT 'GET',
ADD COLUMN     "apiQueryParams" JSONB,
ADD COLUMN     "apiSuccessCodes" JSONB,
ADD COLUMN     "apiTimeout" INTEGER NOT NULL DEFAULT 30000,
ADD COLUMN     "apiUrl" TEXT NOT NULL,
ADD COLUMN     "backoffDelay" INTEGER NOT NULL DEFAULT 1000,
ADD COLUMN     "backoffType" TEXT NOT NULL DEFAULT 'exponential',
ADD COLUMN     "concurrency" TEXT NOT NULL DEFAULT 'skip',
ADD COLUMN     "cronExpression" TEXT,
ADD COLUMN     "endAt" TIMESTAMP(3),
ADD COLUMN     "failSafeThreshold" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "jitter" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notificationDailySummary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notificationHttpCodes" JSONB,
ADD COLUMN     "notificationIncludeLogs" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notificationIncludeResponse" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notificationMaxPerDay" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "notificationMinInterval" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN     "notificationRecipients" JSONB,
ADD COLUMN     "notificationSubject" TEXT NOT NULL DEFAULT '{{job.name}} - {{run.state}}',
ADD COLUMN     "notificationTemplate" TEXT NOT NULL DEFAULT 'Job {{job.name}} finished with status {{run.state}}',
ADD COLUMN     "notificationTrigger" TEXT NOT NULL DEFAULT 'error',
ADD COLUMN     "runOnDeploy" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scheduleMode" TEXT NOT NULL DEFAULT 'preset',
ADD COLUMN     "schedulePreset" TEXT,
ADD COLUMN     "startAt" TIMESTAMP(3),
ADD COLUMN     "timeout" INTEGER NOT NULL DEFAULT 300000,
ALTER COLUMN "retries" SET DEFAULT 3;
