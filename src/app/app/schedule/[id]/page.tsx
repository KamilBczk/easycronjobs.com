"use client";

import { use } from "react";
import { useJobForm } from "@/hooks/use-job-form";
import { JobDetailHeader } from "@/components/job-detail-header";
import { SchedulerBlock } from "@/components/scheduler-block";
import { ApiBlock } from "@/components/api-block";
import { NotificationsBlock } from "@/components/notifications-block";
import { JobOverviewPanel } from "@/components/job-overview-panel";
import { JobQuotasPanel } from "@/components/job-quotas-panel";
import { JobLogsPanel } from "@/components/job-logs-panel";
import { JobHistoryPanel } from "@/components/job-history-panel";
import { JobAuditPanel } from "@/components/job-audit-panel";
import { JobDangerZone } from "@/components/job-danger-zone";

interface JobDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = use(params);
  const {
    formState,
    isLoading,
    isSaving,
    categories,
    updateField,
    resetForm,
    saveForm,
    runJobNow,
    toggleJobStatus,
    duplicateJob,
    deleteJob,
    getNextExecutions,
    addCategory,
  } = useJobForm(id);

  const handleSave = async () => {
    const result = await saveForm();
    if (result.success) {
      // Toast success
      console.log("Saved successfully");
    } else {
      // Toast error
      console.log("Save failed:", result.error);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(formState.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `job-${formState.data.name || "export"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce job ?")) {
      deleteJob();
    }
  };

  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du job...</p>
        </div>
      </div>
    );
  }

  const nextExecutions = getNextExecutions();

  return (
    <div className="flex flex-col h-full">
      <JobDetailHeader
        jobName={formState.data.name}
        isDirty={formState.isDirty}
        isValid={formState.isValid}
        isSaving={isSaving}
        isEnabled={formState.data.status === "enabled"}
        onSave={handleSave}
        onDiscard={resetForm}
        onRunNow={runJobNow}
        onToggleStatus={toggleJobStatus}
        onDuplicate={duplicateJob}
        onExport={handleExport}
        onDelete={handleDelete}
      />

      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column - Forms */}
          <div className="space-y-6">
            <SchedulerBlock
              data={formState.data}
              onUpdate={updateField}
              nextExecutions={nextExecutions}
              errors={formState.errors}
              categories={categories}
              onAddCategory={addCategory}
            />

            <ApiBlock
              data={formState.data}
              onUpdate={updateField}
              errors={formState.errors}
            />

            <NotificationsBlock
              data={formState.data}
              onUpdate={updateField}
              errors={formState.errors}
            />
          </div>

          {/* Right column - Panels */}
          <div className="space-y-6">
            <JobOverviewPanel
              data={formState.data}
              nextExecutions={nextExecutions}
            />

            <JobQuotasPanel />

            <JobLogsPanel />

            <JobHistoryPanel />

            <JobDangerZone
              isEnabled={formState.data.status === "enabled"}
              onToggleStatus={toggleJobStatus}
              onDuplicate={duplicateJob}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
