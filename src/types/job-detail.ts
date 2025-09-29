export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type AuthType = "none" | "bearer" | "basic" | "apikey";

export type ScheduleMode = "preset" | "cron";

export type ConcurrencyMode = "allow" | "queue" | "skip";

export type NotificationTrigger = "always" | "error" | "success" | "status_change" | "http_codes";

export interface KeyValuePair {
  key: string;
  value: string;
  enabled: boolean;
}

export interface AuthConfig {
  type: AuthType;
  token?: string;
  username?: string;
  password?: string;
  apiKey?: string;
  headerName?: string;
}

export interface ScheduleConfig {
  mode: ScheduleMode;
  preset?: string;
  cronExpression?: string;
  timezone: string;
  startAt?: Date;
  endAt?: Date;
  allowedDays: boolean[]; // 0=Sunday, 1=Monday, etc.
  allowedTimeStart?: string; // "09:00"
  allowedTimeEnd?: string; // "17:00"
}

export interface ApiConfig {
  method: HttpMethod;
  url: string;
  auth: AuthConfig;
  queryParams: KeyValuePair[];
  headers: KeyValuePair[];
  body: string;
  bodyType: "json" | "form" | "raw";
  timeout: number;
  followRedirects: boolean;
  successCodes: number[];
  failureCodes: number[];
}

export interface NotificationConfig {
  trigger: NotificationTrigger;
  httpCodes: number[];
  recipients: string[];
  subject: string;
  template: string;
  includeLogs: boolean;
  includeResponse: boolean;
  minInterval: number; // minutes
  maxPerDay: number;
  dailySummary: boolean;
}

export interface JobFormData {
  id?: string;
  name: string;
  status: "enabled" | "disabled";
  category: string;
  description: string;
  schedule: ScheduleConfig;
  api: ApiConfig;
  notifications: NotificationConfig;
  concurrency: ConcurrencyMode;
  timeout: number;
  retries: number;
  backoffType: "linear" | "exponential";
  backoffDelay: number;
  jitter: boolean;
  runOnDeploy: boolean;
  failSafeThreshold: number;
}

export interface JobFormState {
  data: JobFormData;
  isDirty: boolean;
  isValid: boolean;
  errors: Record<string, string>;
}
