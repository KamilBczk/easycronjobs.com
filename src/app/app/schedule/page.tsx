"use client";

import { useSchedule } from "@/hooks/use-schedule";
import { ScheduleHeader } from "@/components/schedule-header";
import { ScheduleStats } from "@/components/schedule-stats";
import { JobsGrid } from "@/components/jobs-grid";
import { JobsTable } from "@/components/jobs-table";
import { JobsPagination } from "@/components/jobs-pagination";

export default function SchedulePage() {
  const {
    state,
    jobs,
    allJobs,
    filteredJobsCount,
    totalPages,
    isLoading,
    categories,
    setView,
    setSelectedCategories,
    setSelectedStatuses,
    clearAllFilters,
    setSort,
    setPage,
    refresh,
  } = useSchedule();

  return (
    <div className="flex flex-col h-full">
      <ScheduleHeader
        view={state.view}
        onViewChange={setView}
        selectedCategories={state.selectedCategories}
        onCategoriesChange={setSelectedCategories}
        selectedStatuses={state.selectedStatuses}
        onStatusesChange={setSelectedStatuses}
        onClearAllFilters={clearAllFilters}
        onRefresh={refresh}
        isLoading={isLoading}
        totalJobs={filteredJobsCount}
        categories={categories}
      />

      <div className="flex-1 p-6 space-y-6">
        <ScheduleStats jobs={allJobs} />

        <div className="space-y-4">
          {state.view === "cards" ? (
            <JobsGrid jobs={jobs} isLoading={isLoading} />
          ) : (
            <JobsTable
              jobs={jobs}
              sortKey={state.sortKey}
              sortOrder={state.sortOrder}
              onSort={setSort}
              isLoading={isLoading}
            />
          )}

          {!isLoading && jobs.length > 0 && (
            <JobsPagination
              currentPage={state.page}
              totalPages={totalPages}
              totalItems={filteredJobsCount}
              pageSize={state.pageSize}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
