import { Job, ExecutionStatus, JobStatus } from "@/types/schedule";

const categories = [
  "Database",
  "API",
  "Cleanup", 
  "Reports",
  "Monitoring",
  "Backup",
  "Email",
  "Analytics"
];

const owners = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Wilson"];

const cronExpressions = [
  { cron: "0 */6 * * *", human: "Every 6 hours" },
  { cron: "0 0 * * *", human: "Daily at midnight" },
  { cron: "*/5 * * * *", human: "Every 5 minutes" },
  { cron: "0 0 * * 1", human: "Weekly on Monday" },
  { cron: "0 2 1 * *", human: "Monthly on 1st at 2AM" },
  { cron: "*/15 * * * *", human: "Every 15 minutes" },
  { cron: "0 */2 * * *", human: "Every 2 hours" },
  { cron: "0 0 */3 * *", human: "Every 3 days" },
];

const jobNames = [
  "User Data Sync",
  "Daily Report Generation", 
  "Cache Cleanup",
  "Database Backup",
  "Email Queue Processing",
  "Log Rotation",
  "API Health Check",
  "Performance Metrics",
  "Security Scan",
  "Data Export",
  "Image Optimization",
  "Invoice Generation",
  "User Onboarding",
  "Notification Dispatch",
  "Analytics Processing"
];

// Générateur de nombres pseudo-aléatoires déterministe pour éviter les erreurs d'hydratation
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

const rng = new SeededRandom(12345); // Seed fixe pour la cohérence

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(rng.next() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(rng.next() * (max - min + 1)) + min;
}

// Date de référence récente pour éviter les erreurs d'hydratation
const REFERENCE_DATE = new Date('2024-12-27T10:00:00Z');

function generateNextExecution(status: JobStatus, index: number): Date | null {
  if (status === "disabled") return null;
  
  // Utiliser l'index pour avoir des dates déterministes mais variées
  const rng = new SeededRandom(12345 + index);
  const minutesFromNow = Math.floor(rng.next() * 2880) + 1; // Between 1 minute and 2 days
  return new Date(REFERENCE_DATE.getTime() + minutesFromNow * 60 * 1000);
}

function generateLastExecution(index: number) {
  const statuses: ExecutionStatus[] = ["ok", "fail", "timeout", "running", "skipped"];
  const rng = new SeededRandom(54321 + index);
  const status = statuses[Math.floor(rng.next() * statuses.length)];
  
  // Utiliser une date récente fixe pour éviter l'hydratation + offset déterministe
  const baseDate = new Date('2024-12-27T10:00:00Z');
  const hoursAgo = Math.floor(rng.next() * 48) + 1; // Between 1 hour and 2 days ago
  const completedAt = new Date(baseDate.getTime() - hoursAgo * 60 * 60 * 1000);
  
  return {
    status,
    completedAt,
    duration: Math.floor(rng.next() * 4900) + 100, // 0.1s to 5s in milliseconds
    exitCode: status === "fail" ? Math.floor(rng.next() * 255) + 1 : 0,
  };
}

export function generateMockJobs(count: number = 150): Job[] {
  const jobs: Job[] = [];
  
  for (let i = 0; i < count; i++) {
    // Réinitialiser le générateur pour chaque job pour avoir de la cohérence
    const jobRng = new SeededRandom(1000 + i);
    const status: JobStatus = jobRng.next() > 0.15 ? "enabled" : "disabled";
    const cronConfig = cronExpressions[Math.floor(jobRng.next() * cronExpressions.length)];
    
    const job: Job = {
      id: `job-${i + 1}`,
      name: `${jobNames[Math.floor(jobRng.next() * jobNames.length)]} ${i + 1}`,
      status,
      category: categories[Math.floor(jobRng.next() * categories.length)],
      nextExecution: generateNextExecution(status, i),
      lastExecution: jobRng.next() > 0.1 ? generateLastExecution(i) : null,
      frequency: cronConfig.cron,
      frequencyHuman: cronConfig.human,
      owner: owners[Math.floor(jobRng.next() * owners.length)],
      failures24h: status === "enabled" ? Math.floor(jobRng.next() * 6) : 0, // 0-5 failures
    };
    
    jobs.push(job);
  }
  
  return jobs;
}

// Générer les données une seule fois de manière déterministe
// On force la régénération en remettant à null
let _mockJobs: Job[] | null = null;

export function getMockJobs(): Job[] {
  // Force la régénération après les corrections de dates
  _mockJobs = generateMockJobs();
  return _mockJobs;
}

export const mockJobs = getMockJobs();
export const mockCategories = categories;
