# EasyCronJobs - Project Summary

## 📖 Overview

**EasyCronJobs** is a SaaS platform that allows users to schedule and monitor HTTP-based cron jobs. Users can create jobs with flexible scheduling (cron expressions or presets), configure HTTP requests (method, headers, auth, body), set up retry policies, and receive notifications on job outcomes.

---

## 🎯 Core Features

### 1. **User Management**
- Authentication via NextAuth (credentials + OAuth)
- Multi-tenant architecture (Teams)
- Role-based access (OWNER, ADMIN, MEMBER)
- Subscription management via Stripe

### 2. **Job Configuration**
Users can create jobs with:
- **Scheduling**: Cron expressions or presets (daily, hourly, etc.)
- **HTTP Config**: Method, URL, headers, query params, body, auth (Bearer, Basic, etc.)
- **Retry Policy**: Number of retries, backoff strategy (linear/exponential), jitter
- **Concurrency**: Allow multiple runs, queue, or skip if already running
- **Time Constraints**: Timezone, allowed days of week, time windows (9am-5pm)
- **Notifications**: Email alerts on success/failure/status change

### 3. **Job Execution** (Worker Service - Separate Repo)
- Execute HTTP requests based on job configuration
- Handle retries with backoff
- Respect time constraints and concurrency rules
- Log execution results (status, response, duration)
- Send notifications via Resend

### 4. **Monitoring & Logs**
- View job run history
- See execution logs (response body, errors)
- Track success/failure rates
- Auto-disable jobs after N consecutive failures (fail-safe)

### 5. **Blog System**
- Admin can publish blog posts
- SEO-friendly (slug-based URLs)
- Draft/published status
- Tags and view tracking

---

## 🏗️ Architecture

### **Tech Stack**

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15 (App Router), React 19, TailwindCSS 4 |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL 16 |
| **ORM** | Prisma 6 |
| **Authentication** | NextAuth v5 (beta) |
| **Payments** | Stripe |
| **Email** | Resend + React Email |
| **UI Components** | Radix UI + shadcn/ui |
| **Forms** | React Hook Form + Zod |
| **Deployment** | Self-hosted (VPS + PM2 + Nginx) |

### **Services Architecture**

```
┌─────────────────────────────────────────────────┐
│            easycronjobs-web (Next.js)           │
│  - User Interface                               │
│  - Job CRUD API                                 │
│  - Subscription management                      │
│  - Blog                                         │
└──────────────────┬──────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │   PostgreSQL      │ (Shared)
         │   Redis           │ (Shared)
         └─────────┬─────────┘
                   │
┌──────────────────┴──────────────────────────────┐
│         easycronjobs-worker (Node.js)           │
│  - BullMQ worker                                │
│  - Job scheduler                                │
│  - HTTP request executor                        │
│  - Retry handler                                │
│  - Notification service                         │
└─────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema (Key Models)

### **User** (Auth)
```
- id, name, email, passwordHash
- isAdmin (for admin features)
- teamMembers, createdTeams, blogPosts
```

### **Team** (Multi-tenant)
```
- id, name, slug
- stripeCustomerId, stripeSubscriptionId, subscriptionStatus
- members (TeamMember[])
- jobs (Job[])
```

### **Job** (Core entity)
```
- id, teamId, name, description, status (ENABLED/DISABLED)
- Schedule: cronExpression, timezone, startAt, endAt, allowedDays, allowedTimeStart/End
- API: apiMethod, apiUrl, apiHeaders, apiBody, apiAuth, apiTimeout
- Retry: retries, backoffType, backoffDelay, jitter
- Notifications: notificationTrigger, recipients, template
- Execution: concurrency, timeout, failSafeThreshold
- runs (JobRun[])
```

### **JobRun** (Execution logs)
```
- id, jobId, state (QUEUED/RUNNING/OK/FAIL/TIMEOUT)
- startedAt, finishedAt, attempts, exitCode, log
```

### **BlogPost**
```
- id, title, slug, content, status (DRAFT/PUBLISHED)
- authorId, tags, views
```

---

## 📁 Project Structure

```
easycronjobs-web/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # Landing page
│   │   ├── login/                # Auth pages
│   │   ├── app/                  # Protected app pages
│   │   │   ├── schedule/         # Job management UI
│   │   │   ├── billing/          # Stripe integration
│   │   │   ├── profile/          # User settings
│   │   │   └── admin/            # Admin dashboard
│   │   ├── blog/                 # Public blog
│   │   └── api/                  # API routes
│   │       ├── jobs/             # Job CRUD
│   │       ├── stripe/           # Stripe webhooks
│   │       ├── blog/             # Blog API
│   │       └── user/             # User API
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── sidebar-nav.tsx
│   │   ├── user-nav.tsx
│   │   └── subscription-guard.tsx
│   ├── lib/                      # Utilities
│   │   ├── stripe.ts             # Stripe client
│   │   ├── subscription.ts       # Subscription logic
│   │   └── require-subscription.ts
│   ├── auth.ts                   # NextAuth config
│   └── aaamiddleware.ts          # Auth middleware
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Prisma migrations
├── public/                       # Static assets
├── .env.local                    # Environment variables
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## 🔐 Authentication & Authorization

### **Middleware** (`src/aaamiddleware.ts`)
- Public paths: `/`, `/login`, `/signup`, `/blog/*`
- Protected paths: `/app/*` → Requires authentication
- Subscription check: Handled in layout via `SubscriptionGuard`
- Admin routes: `/app/admin/*` → Requires `isAdmin: true`

### **Subscription Guard**
Pages requiring an active subscription use the `SubscriptionGuard` component or `requireSubscription()` helper:
```typescript
// Allowed without subscription:
// - /app/billing
// - /app/profile
// - /app/settings

// Requires subscription:
// - /app/schedule (job management)
```

---

## 💳 Subscription & Billing

- **Provider**: Stripe
- **Plans**: Managed via Stripe Prices
- **Billing**: Team-based (one subscription per team)
- **Webhooks**: Handle `customer.subscription.*` events
- **Trial**: Optional trial period (tracked in `Team.trialEndsAt`)

---

## 📧 Email Notifications

- **Provider**: Resend
- **Templates**: React Email components
- **Use Cases**:
  - Job execution alerts (success/failure)
  - Daily summaries
  - Subscription updates

---

## 🚀 Deployment Strategy

### **Production Environment**
- **Web App**: VPS (Hetzner/OVH) + PM2 + Nginx
- **Worker**: Same VPS or separate server + PM2
- **Database**: PostgreSQL (Docker or native)
- **Redis**: Docker or native
- **Reverse Proxy**: Nginx with SSL (Let's Encrypt)

### **CI/CD**
```yaml
# Example GitHub Actions workflow
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install && npm run build
      - run: ssh user@vps "cd ~/app && git pull && pm2 restart all"
```

---

## 🎯 Current Status

### ✅ Completed
- User authentication (credentials + OAuth)
- Multi-tenant team system
- Job creation UI (schedule, HTTP config, retries, notifications)
- Stripe subscription integration
- Blog system
- Database schema (Prisma)
- Middleware for auth/subscription checks

### 🚧 In Progress
- Worker service (separate repo)
  - BullMQ integration
  - Job execution engine
  - Retry logic
  - Notification service

### 📋 TODO
- Job execution monitoring UI
- Real-time job logs (WebSocket?)
- Team member management
- Usage analytics
- API rate limiting

---

## 🔗 Repository Information

### **Main Repository**: `easycronjobs-web`
- Type: Monolith Next.js app
- Purpose: Frontend UI + API + Database schema
- Branch: `main`

### **Worker Repository**: `easycronjobs-worker` (to be created)
- Type: Standalone Node.js service
- Purpose: Job execution engine
- Communication: Redis (BullMQ) + PostgreSQL

---

## 📚 Key Dependencies

```json
{
  "next": "15.5.4",
  "react": "19.1.0",
  "next-auth": "^5.0.0-beta.29",
  "@prisma/client": "^6.16.2",
  "stripe": "^18.5.0",
  "resend": "^6.1.0",
  "zod": "^4.1.11",
  "bcrypt": "^6.0.0",
  "cron-parser": "^5.4.0"
}
```

---

## 🛡️ Security Considerations

- Password hashing with bcrypt
- CSRF protection via NextAuth
- SQL injection prevention (Prisma ORM)
- Rate limiting on API routes (TODO)
- Environment variables for secrets
- Stripe webhook signature verification

---

## 📊 Performance Optimization

- Server-side rendering (Next.js SSR)
- Static generation for blog posts
- Redis caching for subscriptions (TODO)
- Database indexing on frequently queried fields
- Lazy loading of UI components

---

## 🐛 Known Issues / Technical Debt

- [ ] Middleware file named `aaamiddleware.ts` (should be `middleware.ts`)
- [ ] Subscription check done in layout (could be optimized)
- [ ] No real-time updates for job status
- [ ] Missing error boundaries in UI
- [ ] No automated tests yet

---

## 📞 Contact & Resources

- **Database**: PostgreSQL (see `prisma/schema.prisma`)
- **API Docs**: See `src/app/api/*/route.ts` files
- **Stripe Integration**: See `src/lib/stripe.ts`
- **Auth Config**: See `src/auth.ts`

---

**Last Updated**: 2025-09-30

---

## 🎯 Next Steps

1. Create `easycronjobs-worker` repository
2. Implement BullMQ worker with job execution
3. Set up Redis on production server
4. Deploy worker service alongside web app
5. Test end-to-end job execution flow
6. Add monitoring UI for job runs
7. Implement real-time logs (WebSocket)

For detailed worker implementation instructions, see **WORKER_BRIEF.md**.
