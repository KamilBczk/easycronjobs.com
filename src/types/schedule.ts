export type JobStatus = "enabled" | "disabled";

export type ExecutionStatus = "ok" | "fail" | "timeout" | "running" | "skipped";

export interface Job {
  id: string;
  name: string;
  status: JobStatus;
  category: string;
  nextExecution: Date | null;
  lastExecution: {
    status: ExecutionStatus;
    completedAt: Date;
    duration: number; // in milliseconds
    exitCode?: number;
  } | null;
  frequency: string; // cron expression
  frequencyHuman: string; // human readable
  owner: string;
  failures24h: number;
}

export interface ScheduleState {
  view: "cards" | "table";
  selectedCategories: string[];
  selectedStatuses: JobStatus[];
  sortKey: "name" | "nextExecution" | "lastExecution";
  sortOrder: "asc" | "desc";
  page: number;
  pageSize: number;
  searchTerm: string;
}

export const EXECUTION_STATUS_CONFIG = {
  ok: { label: "Success", color: "bg-green-500", textColor: "text-green-700" },
  fail: { label: "Failed", color: "bg-red-500", textColor: "text-red-700" },
  timeout: { label: "Timeout", color: "bg-amber-500", textColor: "text-amber-700" },
  running: { label: "Running", color: "bg-blue-500", textColor: "text-blue-700" },
  skipped: { label: "Skipped", color: "bg-gray-500", textColor: "text-gray-700" },
} as const;
