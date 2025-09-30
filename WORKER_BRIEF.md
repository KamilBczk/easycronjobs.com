# EasyCronJobs - Worker Service Brief

## 📋 Context

This document is a brief for creating a **separate repository** that will handle the **worker/queue service** for the EasyCronJobs platform.

The main repository (`easycronjobs-web`) contains a Next.js application where users can create, configure, and manage scheduled jobs. This worker service will be responsible for **executing** those jobs.

---

## 🎯 Worker Service Objectives

The worker service must:

1. **Poll/Listen** for jobs that need to be executed
2. **Execute HTTP requests** based on job configuration (method, URL, headers, body, auth, etc.)
3. **Handle retries** with exponential/linear backoff and jitter
4. **Manage concurrency** (allow multiple runs, queue, or skip)
5. **Log execution results** back to PostgreSQL
6. **Send notifications** based on job outcomes (email via Resend)
7. **Respect scheduling constraints** (timezone, allowed days/times, start/end dates)
8. **Auto-disable jobs** that exceed fail-safe threshold

---

## 🗄️ Database Schema (PostgreSQL)

The worker will **read and write** to the following tables:

### **Job** (Read-only for worker)
```prisma
model Job {
  id          String    @id @default(cuid())
  teamId      String
  categoryId  String?
  name        String
  description String?
  status      JobStatus @default(ENABLED) // ENABLED | DISABLED

  // Schedule configuration
  scheduleMode     String    @default("preset") // "preset" | "cron"
  schedulePreset   String?                      // "daily", "hourly", etc.
  cronExpression   String?                      // "0 9 * * 1-5"
  timezone         String    @default("UTC")
  startAt          DateTime?                    // Job won't run before this
  endAt            DateTime?                    // Job won't run after this
  allowedDays      Json?                        // [true,true,true,true,true,false,false]
  allowedTimeStart String?                      // "09:00"
  allowedTimeEnd   String?                      // "17:00"

  // API configuration
  apiMethod          String  @default("GET")
  apiUrl             String
  apiAuth            Json?                      // { type: "bearer", token: "..." }
  apiQueryParams     Json?                      // [{ key: "foo", value: "bar" }]
  apiHeaders         Json?                      // [{ key: "Content-Type", value: "application/json" }]
  apiBody            String?
  apiBodyType        String  @default("json")   // "json" | "form" | "raw"
  apiTimeout         Int     @default(30000)    // milliseconds
  apiFollowRedirects Boolean @default(true)
  apiSuccessCodes    Json?                      // [200, 201, 204]
  apiFailureCodes    Json?                      // [500, 502, 503]

  // Notification configuration
  notificationTrigger         String  @default("error") // "always" | "error" | "success" | "status_change" | "http_codes"
  notificationHttpCodes       Json?                     // [404, 500]
  notificationRecipients      Json?                     // ["user@example.com"]
  notificationSubject         String  @default("{{job.name}} - {{run.state}}")
  notificationTemplate        String  @default("Job {{job.name}} finished with status {{run.state}}")
  notificationIncludeLogs     Boolean @default(true)
  notificationIncludeResponse Boolean @default(false)
  notificationMinInterval     Int     @default(15)      // minutes between notifications
  notificationMaxPerDay       Int     @default(10)
  notificationDailySummary    Boolean @default(false)

  // Execution configuration
  concurrency       String  @default("skip")         // "allow" | "queue" | "skip"
  timeout           Int     @default(300000)         // milliseconds
  retries           Int     @default(3)
  backoffType       String  @default("exponential")  // "linear" | "exponential"
  backoffDelay      Int     @default(1000)           // milliseconds
  jitter            Boolean @default(true)
  runOnDeploy       Boolean @default(false)
  failSafeThreshold Int     @default(5)              // Disable job after N consecutive failures

  runs      JobRun[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([teamId, status])
}

enum JobStatus {
  ENABLED
  DISABLED
}
```

### **JobRun** (Read & Write for worker)
```prisma
model JobRun {
  id         String    @id @default(cuid())
  jobId      String
  state      RunState  @default(QUEUED)
  startedAt  DateTime  @default(now())
  finishedAt DateTime?
  attempts   Int       @default(1)
  exitCode   Int?                          // HTTP status code
  log        String?   @db.Text            // Response body or error message

  job Job @relation(fields: [jobId], references: [id], onDelete: Cascade)

  @@index([jobId, state])
}

enum RunState {
  QUEUED    // Job added to queue
  RUNNING   // Currently executing
  OK        // Successful execution
  FAIL      // Failed execution
  TIMEOUT   // Execution timed out
}
```

---

## 🏗️ Technical Stack

- **Language**: TypeScript + Node.js 20+
- **Queue**: BullMQ (Redis-based)
- **Database**: PostgreSQL via Prisma
- **HTTP Client**: Native `fetch` or `undici`
- **Process Manager**: PM2 (production)
- **Notifications**: Resend (email API)

---

## 📁 Recommended Project Structure

```
easycronjobs-worker/
├── src/
│   ├── index.ts                    # Entry point (starts worker)
│   ├── config/
│   │   ├── redis.ts                # Redis connection config
│   │   ├── database.ts             # Prisma client singleton
│   │   └── env.ts                  # Environment variables validation
│   ├── queues/
│   │   └── job-queue.ts            # BullMQ Queue & Worker definition
│   ├── processors/
│   │   └── job-processor.ts        # Main job execution logic
│   ├── services/
│   │   ├── scheduler.ts            # Sync jobs from DB to queue
│   │   ├── http-executor.ts        # Execute HTTP requests
│   │   ├── logger.ts               # Write JobRun logs to DB
│   │   ├── notifier.ts             # Send email notifications
│   │   └── retry-handler.ts        # Retry logic with backoff
│   └── utils/
│       ├── cron-parser.ts          # Parse cron expressions
│       ├── time-constraints.ts     # Check allowed days/times
│       └── template-engine.ts      # Replace {{job.name}} in notifications
├── prisma/
│   └── schema.prisma               # Copy from easycronjobs-web
├── .env.example
├── package.json
├── tsconfig.json
├── ecosystem.config.js             # PM2 config
└── README.md
```

---

## 🔄 Worker Workflow

### 1. **Job Synchronization** (Every 30 seconds)
```typescript
// Fetch all ENABLED jobs from DB
const jobs = await prisma.job.findMany({
  where: { status: 'ENABLED' }
});

// Add/update jobs in BullMQ with their cron schedule
for (const job of jobs) {
  await jobQueue.add(
    job.id,
    { jobId: job.id },
    {
      repeat: {
        pattern: job.cronExpression,
        tz: job.timezone
      },
      jobId: job.id // Prevent duplicates
    }
  );
}
```

### 2. **Job Execution**
```typescript
// Worker processes job from queue
worker.process(async (bullJob) => {
  const jobId = bullJob.data.jobId;

  // 1. Fetch job config from DB
  const job = await prisma.job.findUnique({ where: { id: jobId } });

  // 2. Check time constraints (timezone, allowed days/times)
  if (!isAllowedToRun(job)) {
    return; // Skip this run
  }

  // 3. Check concurrency
  if (job.concurrency === 'skip') {
    const runningJobs = await prisma.jobRun.count({
      where: { jobId, state: 'RUNNING' }
    });
    if (runningJobs > 0) return; // Skip
  }

  // 4. Create JobRun record
  const run = await prisma.jobRun.create({
    data: {
      jobId: job.id,
      state: 'RUNNING'
    }
  });

  // 5. Execute HTTP request with retries
  const result = await executeWithRetries(job, run.id);

  // 6. Update JobRun with result
  await prisma.jobRun.update({
    where: { id: run.id },
    data: {
      state: result.success ? 'OK' : 'FAIL',
      finishedAt: new Date(),
      exitCode: result.statusCode,
      log: result.log,
      attempts: result.attempts
    }
  });

  // 7. Send notification if needed
  if (shouldNotify(job, result)) {
    await sendNotification(job, run, result);
  }

  // 8. Check fail-safe threshold
  if (await shouldDisableJob(job)) {
    await prisma.job.update({
      where: { id: job.id },
      data: { status: 'DISABLED' }
    });
  }
});
```

### 3. **HTTP Execution with Retries**
```typescript
async function executeWithRetries(job: Job, runId: string) {
  let attempts = 0;
  let lastError = null;

  while (attempts < job.retries) {
    attempts++;

    try {
      const response = await fetch(job.apiUrl, {
        method: job.apiMethod,
        headers: buildHeaders(job),
        body: job.apiBody,
        signal: AbortSignal.timeout(job.apiTimeout)
      });

      // Check if status code is considered success
      const isSuccess = job.apiSuccessCodes
        ? job.apiSuccessCodes.includes(response.status)
        : response.ok;

      const body = await response.text();

      if (isSuccess) {
        return {
          success: true,
          statusCode: response.status,
          log: body,
          attempts
        };
      }

      lastError = `HTTP ${response.status}: ${body}`;

    } catch (error) {
      lastError = error.message;
    }

    // Wait before retry (with backoff)
    if (attempts < job.retries) {
      const delay = calculateBackoff(job, attempts);
      await sleep(delay);
    }
  }

  return {
    success: false,
    statusCode: null,
    log: lastError,
    attempts
  };
}
```

---

## 🔐 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/easycronjobs

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Resend (notifications)
RESEND_API_KEY=re_xxxxx

# Optional
NODE_ENV=production
LOG_LEVEL=info
WORKER_CONCURRENCY=5
```

---

## 🚀 Deployment

### Development
```bash
npm install
npx prisma generate
npm run dev
```

### Production (PM2)
```bash
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 📊 Key Features to Implement

### Must-Have
- ✅ Job execution with HTTP requests
- ✅ Retry logic with exponential/linear backoff
- ✅ Cron scheduling with timezone support
- ✅ Logging to PostgreSQL (JobRun)
- ✅ Concurrency control (allow/queue/skip)
- ✅ Fail-safe threshold (auto-disable jobs)

### Nice-to-Have
- ✅ Email notifications (Resend)
- ✅ Time constraints (allowed days/times)
- ✅ Template engine for notifications
- ✅ Notification throttling (min interval, max per day)
- ✅ Graceful shutdown
- ✅ Health check endpoint

### Future
- 📊 Metrics/monitoring (Prometheus)
- 🔔 Webhook notifications
- 🔄 Job dependencies/chains
- 📈 Performance tracking

---

## 🔗 Communication with Main App

The worker communicates with the main app through:

1. **Shared PostgreSQL database** (read Job, write JobRun)
2. **Shared Redis** (BullMQ queue)

The main Next.js app can trigger immediate job execution by adding a job to the queue:

```typescript
// In Next.js API route
import { Queue } from 'bullmq';

const queue = new Queue('jobs', {
  connection: { host: 'redis', port: 6379 }
});

// Trigger immediate execution
await queue.add('execute-now', { jobId: 'cuid123' });
```

---

## 📝 Additional Notes

- Worker should be **stateless** (can scale horizontally)
- Use **Prisma transactions** when updating job states
- Handle **SIGTERM/SIGINT** for graceful shutdown
- Log all errors to **stdout/stderr** (captured by PM2)
- Keep **Prisma schema** in sync with main repo (use git submodule or sync script)

---

## 🎯 Success Criteria

The worker is successful when:

1. ✅ Jobs execute at their scheduled time (within 1-2 sec tolerance)
2. ✅ Failed jobs retry according to configuration
3. ✅ Logs are written to database correctly
4. ✅ Jobs respect concurrency settings
5. ✅ Time constraints are enforced (timezone, allowed days/times)
6. ✅ Notifications are sent reliably
7. ✅ Worker can restart without losing scheduled jobs
8. ✅ Worker handles job configuration changes dynamically

---

## 📚 Useful Resources

- [BullMQ Documentation](https://docs.bullmq.io/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Cron Expression Parser](https://www.npmjs.com/package/cron-parser)
- [Resend API](https://resend.com/docs)

---

**Good luck building the worker! 🚀**
