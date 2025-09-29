import { Job, JobCategory } from "@prisma/client";
import { JobFormData, AuthConfig, KeyValuePair, ScheduleConfig, ApiConfig, NotificationConfig } from "@/types/job-detail";

export function jobToFormData(job: Job & { category?: JobCategory | null }): JobFormData {
  return {
    id: job.id,
    name: job.name,
    status: job.status.toLowerCase() as "enabled" | "disabled",
    category: job.category?.name || "",
    description: job.description || "",
    schedule: {
      mode: job.scheduleMode as "preset" | "cron",
      preset: job.schedulePreset || "daily",
      cronExpression: job.cronExpression || "0 0 * * *",
      timezone: job.timezone,
      startAt: job.startAt,
      endAt: job.endAt,
      allowedDays: job.allowedDays as boolean[] || [true, true, true, true, true, true, true],
      allowedTimeStart: job.allowedTimeStart,
      allowedTimeEnd: job.allowedTimeEnd,
    } as ScheduleConfig,
    api: {
      method: job.apiMethod as any,
      url: job.apiUrl,
      auth: (job.apiAuth as AuthConfig) || { type: "none" },
      queryParams: (job.apiQueryParams as KeyValuePair[]) || [],
      headers: (job.apiHeaders as KeyValuePair[]) || [],
      body: job.apiBody || "",
      bodyType: job.apiBodyType as "json" | "form" | "raw",
      timeout: job.apiTimeout,
      followRedirects: job.apiFollowRedirects,
      successCodes: job.apiSuccessCodes as number[] || [200],
      failureCodes: job.apiFailureCodes as number[] || [],
    } as ApiConfig,
    notifications: {
      trigger: job.notificationTrigger as any,
      httpCodes: job.notificationHttpCodes as number[] || [],
      recipients: job.notificationRecipients as string[] || [],
      subject: job.notificationSubject,
      template: job.notificationTemplate,
      includeLogs: job.notificationIncludeLogs,
      includeResponse: job.notificationIncludeResponse,
      minInterval: job.notificationMinInterval,
      maxPerDay: job.notificationMaxPerDay,
      dailySummary: job.notificationDailySummary,
    } as NotificationConfig,
    concurrency: job.concurrency as any,
    timeout: job.timeout,
    retries: job.retries,
    backoffType: job.backoffType as "linear" | "exponential",
    backoffDelay: job.backoffDelay,
    jitter: job.jitter,
    runOnDeploy: job.runOnDeploy,
    failSafeThreshold: job.failSafeThreshold,
  };
}

export function formDataToJobUpdate(formData: JobFormData) {
  return {
    name: formData.name,
    description: formData.description,
    status: formData.status.toUpperCase() as "ENABLED" | "DISABLED",
    categoryId: formData.category || null, // La catégorie peut être un ID ou null

    // Schedule
    scheduleMode: formData.schedule.mode,
    schedulePreset: formData.schedule.preset,
    cronExpression: formData.schedule.cronExpression,
    timezone: formData.schedule.timezone,
    startAt: formData.schedule.startAt,
    endAt: formData.schedule.endAt,
    allowedDays: formData.schedule.allowedDays as any,
    allowedTimeStart: formData.schedule.allowedTimeStart,
    allowedTimeEnd: formData.schedule.allowedTimeEnd,

    // API
    apiMethod: formData.api.method,
    apiUrl: formData.api.url,
    apiAuth: formData.api.auth as any,
    apiQueryParams: formData.api.queryParams as any,
    apiHeaders: formData.api.headers as any,
    apiBody: formData.api.body,
    apiBodyType: formData.api.bodyType,
    apiTimeout: formData.api.timeout,
    apiFollowRedirects: formData.api.followRedirects,
    apiSuccessCodes: formData.api.successCodes as any,
    apiFailureCodes: formData.api.failureCodes as any,

    // Notifications
    notificationTrigger: formData.notifications.trigger,
    notificationHttpCodes: formData.notifications.httpCodes as any,
    notificationRecipients: formData.notifications.recipients as any,
    notificationSubject: formData.notifications.subject,
    notificationTemplate: formData.notifications.template,
    notificationIncludeLogs: formData.notifications.includeLogs,
    notificationIncludeResponse: formData.notifications.includeResponse,
    notificationMinInterval: formData.notifications.minInterval,
    notificationMaxPerDay: formData.notifications.maxPerDay,
    notificationDailySummary: formData.notifications.dailySummary,

    // Execution
    concurrency: formData.concurrency,
    timeout: formData.timeout,
    retries: formData.retries,
    backoffType: formData.backoffType,
    backoffDelay: formData.backoffDelay,
    jitter: formData.jitter,
    runOnDeploy: formData.runOnDeploy,
    failSafeThreshold: formData.failSafeThreshold,
  };
}